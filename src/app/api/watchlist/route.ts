import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { watchlists } from "@/lib/db/schema";
import { ensureUserInitialized } from "@/lib/auth/user-init";
import { TIER_LIMITS } from "@/lib/auth/tiers";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

// GET all watchlists for the current user
export async function GET() {
  try {
    const { userId, tier } = await ensureUserInitialized();

    const userWatchlists = await db
      .select()
      .from(watchlists)
      .where(eq(watchlists.userId, userId))
      .orderBy(watchlists.createdAt);

    return NextResponse.json({
      success: true,
      data: userWatchlists,
      limits: {
        maxWatchlists: TIER_LIMITS[tier].watchlistCount,
        maxSymbolsPerWatchlist: TIER_LIMITS[tier].watchlistSymbolLimit,
        current: userWatchlists.length,
      },
    });
  } catch (error) {
    console.error("GET watchlist error:", error);
    return NextResponse.json(
      { error: "Failed to fetch watchlists" },
      { status: 500 },
    );
  }
}

// POST - Create a new watchlist
export async function POST(request: Request) {
  try {
    const { userId, tier } = await ensureUserInitialized();
    const { name, symbols = [], isDefault = false } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Watchlist name is required" },
        { status: 400 },
      );
    }

    // Check watchlist count limit
    const existingWatchlists = await db
      .select()
      .from(watchlists)
      .where(eq(watchlists.userId, userId));

    const limit = TIER_LIMITS[tier].watchlistCount;
    if (limit !== Infinity && existingWatchlists.length >= limit) {
      return NextResponse.json(
        {
          error: "Watchlist limit reached",
          message: `Your ${tier} tier allows ${limit} watchlist${limit > 1 ? "s" : ""}. Upgrade to add more.`,
          current: existingWatchlists.length,
          limit,
        },
        { status: 403 },
      );
    }

    // Check symbol limit
    const symbolLimit = TIER_LIMITS[tier].watchlistSymbolLimit;
    if (symbolLimit !== Infinity && symbols.length > symbolLimit) {
      return NextResponse.json(
        {
          error: "Symbol limit exceeded",
          message: `Your ${tier} tier allows ${symbolLimit} symbols per watchlist.`,
          current: symbols.length,
          limit: symbolLimit,
        },
        { status: 403 },
      );
    }

    // Create watchlist
    const newWatchlist = await db
      .insert(watchlists)
      .values({
        id: nanoid(),
        userId,
        name: name.trim(),
        symbols: symbols.map((s: string) => s.toUpperCase()),
        isDefault,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newWatchlist[0],
    });
  } catch (error) {
    console.error("POST watchlist error:", error);
    return NextResponse.json(
      { error: "Failed to create watchlist" },
      { status: 500 },
    );
  }
}

// PUT - Update a watchlist
export async function PUT(request: Request) {
  try {
    const { userId, tier } = await ensureUserInitialized();
    const { id, name, symbols, isDefault } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Watchlist ID is required" },
        { status: 400 },
      );
    }

    // Verify ownership
    const existing = await db
      .select()
      .from(watchlists)
      .where(and(eq(watchlists.id, id), eq(watchlists.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Watchlist not found" },
        { status: 404 },
      );
    }

    // Check symbol limit if symbols are being updated
    if (symbols) {
      const symbolLimit = TIER_LIMITS[tier].watchlistSymbolLimit;
      if (symbolLimit !== Infinity && symbols.length > symbolLimit) {
        return NextResponse.json(
          {
            error: "Symbol limit exceeded",
            message: `Your ${tier} tier allows ${symbolLimit} symbols per watchlist.`,
            current: symbols.length,
            limit: symbolLimit,
          },
          { status: 403 },
        );
      }
    }

    // Build update object
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name.trim();
    if (symbols !== undefined)
      updateData.symbols = symbols.map((s: string) => s.toUpperCase());
    if (isDefault !== undefined) updateData.isDefault = isDefault;

    const updated = await db
      .update(watchlists)
      .set(updateData)
      .where(and(eq(watchlists.id, id), eq(watchlists.userId, userId)))
      .returning();

    return NextResponse.json({
      success: true,
      data: updated[0],
    });
  } catch (error) {
    console.error("PUT watchlist error:", error);
    return NextResponse.json(
      { error: "Failed to update watchlist" },
      { status: 500 },
    );
  }
}

// DELETE - Delete a watchlist
export async function DELETE(request: Request) {
  try {
    const { userId } = await ensureUserInitialized();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Watchlist ID is required" },
        { status: 400 },
      );
    }

    // Verify ownership and delete
    const deleted = await db
      .delete(watchlists)
      .where(and(eq(watchlists.id, id), eq(watchlists.userId, userId)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "Watchlist not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: deleted[0],
    });
  } catch (error) {
    console.error("DELETE watchlist error:", error);
    return NextResponse.json(
      { error: "Failed to delete watchlist" },
      { status: 500 },
    );
  }
}
