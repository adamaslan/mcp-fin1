import { NextResponse } from "next/server";
import type { PortfolioRiskData } from "@/lib/firebase/types";
import { getPortfolioRiskDataWithSource } from "@/lib/firebase/portfolio-data";

/**
 * Public endpoint for landing page portfolio risk demo.
 * Reads demo data with fallback chain: Firestore demo → cache → local file.
 * Returns 503 if no data source is available.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const { data, source } = await getPortfolioRiskDataWithSource();

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Portfolio demo data not available. Run seed script or check Firebase configuration.",
          source: null,
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
      source, // "firestore_demo" | "firestore_cache" | "local_json"
    });
  } catch (error) {
    console.error("Failed to fetch portfolio demo:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Portfolio data unavailable.",
        details: error instanceof Error ? error.message : "Unknown error",
        source: null,
      },
      { status: 503 },
    );
  }
}

// Revalidate every 5 minutes for fresher data
export const revalidate = 300;
