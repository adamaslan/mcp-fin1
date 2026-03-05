import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase/admin";

const VALID_HORIZONS = [
  "1w",
  "2w",
  "1m",
  "2m",
  "3m",
  "6m",
  "52w",
  "2y",
  "3y",
  "5y",
  "10y",
];

interface IndustryDoc {
  industry: string;
  etf: string;
  updated: string;
  returns: Record<string, number | null>;
}

export async function POST(request: Request) {
  try {
    const { horizon = "1w", top_n = 50 } = await request.json();

    if (!VALID_HORIZONS.includes(horizon)) {
      return NextResponse.json(
        {
          error: `Invalid horizon. Must be one of: ${VALID_HORIZONS.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Read directly from Firestore industry_cache collection
    // (written by the Python industry tracker scripts)
    const db = getDb();
    const snapshot = await db.collection("industry_cache").get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: "No industry data available" },
        { status: 404 },
      );
    }

    const performances: IndustryDoc[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data() as IndustryDoc;
      if (data.returns?.[horizon] !== undefined) {
        performances.push(data);
      }
    });

    // Sort by return for the requested horizon
    const sorted = performances
      .filter((p) => p.returns[horizon] !== null)
      .sort((a, b) => (b.returns[horizon] ?? 0) - (a.returns[horizon] ?? 0));

    const count = Math.min(top_n, sorted.length);
    const half = Math.ceil(count / 2);

    const top_performers = sorted.slice(0, half);
    const worst_performers = sorted.slice(-half).reverse();

    const returnValues = sorted
      .map((p) => p.returns[horizon] ?? 0)
      .filter((v) => v !== null);

    const metrics = {
      average_return:
        returnValues.length > 0
          ? returnValues.reduce((a, b) => a + b, 0) / returnValues.length
          : 0,
      positive_count: returnValues.filter((v) => v > 0).length,
      negative_count: returnValues.filter((v) => v < 0).length,
    };

    return NextResponse.json({
      success: true,
      horizon,
      top_n,
      data: { top_performers, worst_performers, metrics },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[API /mcp/industry-tracker] Error:", errorMessage);

    return NextResponse.json(
      {
        error: "Failed to fetch industry tracker data",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    );
  }
}
