import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { watchlists } from "@/lib/db/schema";
import { ensureUserInitialized } from "@/lib/auth/user-init";
import { TIER_LIMITS } from "@/lib/auth/tiers";
import { eq, and } from "drizzle-orm";

/**
 * POST /api/watchlist/symbols
 * Add a symbol to a watchlist
 */
export async function POST(request: Request) {
  try {
    const { userId, tier } = await ensureUserInitialized();
    const { watchlistId, symbol } = await request.json();

    if (!watchlistId || !symbol) {
      return NextResponse.json(
        { error: "Watchlist ID and symbol are required" },
        { status: 400 },
      );
    }

    // Get the watchlist
    const watchlist = await db
      .select()
      .from(watchlists)
      .where(and(eq(watchlists.id, watchlistId), eq(watchlists.userId, userId)))
      .limit(1);

    if (watchlist.length === 0) {
      return NextResponse.json(
        { error: "Watchlist not found" },
        { status: 404 },
      );
    }

    const currentSymbols = watchlist[0].symbols || [];
    const normalizedSymbol = symbol.toUpperCase();

    // Check if symbol already exists
    if (currentSymbols.includes(normalizedSymbol)) {
      return NextResponse.json(
        { error: "Symbol already in watchlist" },
        { status: 400 },
      );
    }

    // Check symbol limit
    const symbolLimit = TIER_LIMITS[tier].watchlistSymbolLimit;
    if (symbolLimit !== Infinity && currentSymbols.length >= symbolLimit) {
      return NextResponse.json(
        {
          error: "Symbol limit reached",
          message: `Your ${tier} tier allows ${symbolLimit} symbols per watchlist.`,
          current: currentSymbols.length,
          limit: symbolLimit,
        },
        { status: 403 },
      );
    }

    // Add symbol
    const updatedSymbols = [...currentSymbols, normalizedSymbol];
    const updated = await db
      .update(watchlists)
      .set({
        symbols: updatedSymbols,
        updatedAt: new Date(),
      })
      .where(and(eq(watchlists.id, watchlistId), eq(watchlists.userId, userId)))
      .returning();

    return NextResponse.json({
      success: true,
      data: updated[0],
    });
  } catch (error) {
    console.error("Add symbol error:", error);
    return NextResponse.json(
      { error: "Failed to add symbol" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/watchlist/symbols
 * Remove a symbol from a watchlist
 */
export async function DELETE(request: Request) {
  try {
    const { userId } = await ensureUserInitialized();
    const { searchParams } = new URL(request.url);
    const watchlistId = searchParams.get("watchlistId");
    const symbol = searchParams.get("symbol");

    if (!watchlistId || !symbol) {
      return NextResponse.json(
        { error: "Watchlist ID and symbol are required" },
        { status: 400 },
      );
    }

    // Get the watchlist
    const watchlist = await db
      .select()
      .from(watchlists)
      .where(and(eq(watchlists.id, watchlistId), eq(watchlists.userId, userId)))
      .limit(1);

    if (watchlist.length === 0) {
      return NextResponse.json(
        { error: "Watchlist not found" },
        { status: 404 },
      );
    }

    const currentSymbols = watchlist[0].symbols || [];
    const normalizedSymbol = symbol.toUpperCase();

    // Remove symbol
    const updatedSymbols = currentSymbols.filter(
      (s: string) => s !== normalizedSymbol,
    );

    if (updatedSymbols.length === currentSymbols.length) {
      return NextResponse.json(
        { error: "Symbol not found in watchlist" },
        { status: 404 },
      );
    }

    const updated = await db
      .update(watchlists)
      .set({
        symbols: updatedSymbols,
        updatedAt: new Date(),
      })
      .where(and(eq(watchlists.id, watchlistId), eq(watchlists.userId, userId)))
      .returning();

    return NextResponse.json({
      success: true,
      data: updated[0],
    });
  } catch (error) {
    console.error("Remove symbol error:", error);
    return NextResponse.json(
      { error: "Failed to remove symbol" },
      { status: 500 },
    );
  }
}
