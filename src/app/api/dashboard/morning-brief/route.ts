import { NextResponse } from "next/server";
import { getMCPClient } from "@/lib/mcp/client";
import { ensureUserInitialized } from "@/lib/auth/user-init";
import { db } from "@/lib/db/client";
import { watchlists } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Authenticated morning brief endpoint for dashboard
 * Includes user's default watchlist
 * Free tier: Shows default watchlist + market overview
 * Pro/Max: Shows all watchlists
 */
export async function GET() {
  try {
    const { userId, tier } = await ensureUserInitialized();

    // Get user's default watchlist
    const userWatchlists = await db
      .select()
      .from(watchlists)
      .where(eq(watchlists.userId, userId))
      .limit(1);

    const watchlistSymbols =
      userWatchlists.length > 0
        ? userWatchlists[0].symbols
        : ["SPY", "QQQ", "AAPL"]; // Default fallback

    const mcp = getMCPClient();
    const brief = await mcp.morningBrief(watchlistSymbols, "US");

    return NextResponse.json({
      success: true,
      data: brief,
      tier,
    });
  } catch (error) {
    console.error("Dashboard morning brief error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch morning brief",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
