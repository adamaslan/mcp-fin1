import { NextResponse } from "next/server";
import { getMCPClient } from "@/lib/mcp/client";
import { ensureUserInitialized } from "@/lib/auth/user-init";
import { db } from "@/lib/db/client";
import { watchlists } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Fetch signals for all symbols in user's watchlists
 * Batches requests via morning brief endpoint
 */
export async function GET() {
  try {
    const { userId } = await ensureUserInitialized();

    // Get all user watchlists
    const userWatchlists = await db
      .select()
      .from(watchlists)
      .where(eq(watchlists.userId, userId));

    if (userWatchlists.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Collect all unique symbols across watchlists
    const allSymbols = Array.from(
      new Set(userWatchlists.flatMap((w) => w.symbols)),
    );

    const mcp = getMCPClient();

    // Batch fetch morning brief with all symbols
    const brief = await mcp.morningBrief(allSymbols, "US");

    // Create a map of signals by symbol
    const signalsBySymbol: Record<string, (typeof brief.watchlist_signals)[0]> =
      {};
    brief.watchlist_signals?.forEach((signal) => {
      signalsBySymbol[signal.symbol] = signal;
    });

    // Attach signals to each watchlist
    const watchlistsWithSignals = userWatchlists.map((watchlist) => ({
      ...watchlist,
      signals: watchlist.symbols.map(
        (symbol) =>
          signalsBySymbol[symbol] || {
            symbol,
            price: 0,
            change_percent: 0,
            action: "HOLD" as const,
            risk_assessment: "HOLD" as const,
            top_signals: [],
            key_support: 0,
            key_resistance: 0,
          },
      ),
    }));

    return NextResponse.json({
      success: true,
      data: watchlistsWithSignals,
      timestamp: brief.timestamp,
    });
  } catch (error) {
    console.error("Watchlist signals error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch watchlist signals",
      },
      { status: 500 },
    );
  }
}
