import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase/admin";
import type { PortfolioRiskData } from "@/lib/firebase/types";

/**
 * Public endpoint for landing page portfolio risk demo.
 * Reads the seeded demo data from Firestore — no auth required.
 * Returns 503 if Firebase is unavailable.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const db = getDb();
    const snap = await db.collection("demo").doc("portfolio_risk").get();

    if (!snap.exists) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Portfolio demo data not seeded yet. Run: npx tsx scripts/seed-portfolio-to-firebase.ts",
        },
        { status: 503 },
      );
    }

    const data = snap.data() as PortfolioRiskData;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Failed to fetch portfolio demo from Firestore:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Portfolio data unavailable. Check Firebase configuration.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    );
  }
}

// Revalidate every 5 minutes for fresher data
export const revalidate = 300;
