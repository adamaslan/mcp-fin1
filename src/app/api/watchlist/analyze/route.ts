import { NextResponse } from "next/server";
import { getMCPClient } from "@/lib/mcp/client";
import { db } from "@/lib/db/client";
import { watchlists } from "@/lib/db/schema";
import { ensureUserInitialized } from "@/lib/auth/user-init";
import { canAccessFeature } from "@/lib/auth/tiers";
import { eq, and } from "drizzle-orm";

/**
 * POST /api/watchlist/analyze
 * Batch analyze all symbols in a watchlist (Pro/Max feature)
 * Returns summarized signals for each symbol
 */
export async function POST(request: Request) {
  try {
    const { userId, tier } = await ensureUserInitialized();

    // Check if user has access to this feature (Pro or Max only)
    if (tier === "free") {
      return NextResponse.json(
        {
          error: "Feature not available",
          message:
            "Batch watchlist analysis is a Pro/Max feature. Upgrade to unlock.",
          upgradeRequired: true,
          requiredTier: "pro",
        },
        { status: 403 },
      );
    }

    const { watchlistId, period = "1mo" } = await request.json();

    if (!watchlistId) {
      return NextResponse.json(
        { error: "Watchlist ID is required" },
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

    const symbols = watchlist[0].symbols;

    if (!symbols || symbols.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          watchlistId,
          watchlistName: watchlist[0].name,
          results: [],
          summary: {
            total: 0,
            bullish: 0,
            bearish: 0,
            neutral: 0,
          },
        },
      });
    }

    // Analyze each symbol
    const mcp = getMCPClient();
    const results = await Promise.allSettled(
      symbols.map(async (symbol: string) => {
        try {
          const analysis = await mcp.analyzeSecurity(symbol, period, false);

          // Calculate signal summary
          const signals = analysis.signals || [];
          const bullishCount = signals.filter(
            (s: any) => s.direction === "bullish",
          ).length;
          const bearishCount = signals.filter(
            (s: any) => s.direction === "bearish",
          ).length;
          const neutralCount = signals.length - bullishCount - bearishCount;

          // Determine overall sentiment
          let sentiment: "bullish" | "bearish" | "neutral" = "neutral";
          if (bullishCount > bearishCount * 1.5) sentiment = "bullish";
          else if (bearishCount > bullishCount * 1.5) sentiment = "bearish";

          return {
            symbol,
            success: true,
            sentiment,
            signalCounts: {
              total: signals.length,
              bullish: bullishCount,
              bearish: bearishCount,
              neutral: neutralCount,
            },
            price: analysis.price,
            priceChange: analysis.change,
            priceChangePercent: (analysis.change / analysis.price) * 100,
            // Include top 3 signals for quick view
            topSignals: signals.slice(0, 3).map((s: any) => ({
              name: s.name,
              direction: s.direction,
              strength: s.strength,
            })),
          };
        } catch (error) {
          console.error(`Failed to analyze ${symbol}:`, error);
          return {
            symbol,
            success: false,
            error: "Analysis failed",
          };
        }
      }),
    );

    // Process results
    const analysisResults = results.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        return {
          symbol: symbols[index],
          success: false,
          error: "Analysis failed",
        };
      }
    });

    // Calculate overall summary
    const successfulResults = analysisResults.filter((r) => r.success);
    const summary = {
      total: successfulResults.length,
      bullish: successfulResults.filter((r) => r.sentiment === "bullish")
        .length,
      bearish: successfulResults.filter((r) => r.sentiment === "bearish")
        .length,
      neutral: successfulResults.filter((r) => r.sentiment === "neutral")
        .length,
      failed: analysisResults.filter((r) => !r.success).length,
    };

    return NextResponse.json({
      success: true,
      data: {
        watchlistId,
        watchlistName: watchlist[0].name,
        results: analysisResults,
        summary,
        tier,
      },
    });
  } catch (error) {
    console.error("Watchlist analyze error:", error);
    return NextResponse.json(
      { error: "Failed to analyze watchlist" },
      { status: 500 },
    );
  }
}
