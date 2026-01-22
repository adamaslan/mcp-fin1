import { NextResponse } from "next/server";
import { getMCPClient } from "@/lib/mcp/client";
import { db } from "@/lib/db/client";
import { watchlists } from "@/lib/db/schema";
import { ensureUserInitialized } from "@/lib/auth/user-init";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/watchlist/signals?watchlistId=xxx
 * Get top trading opportunities from a watchlist (Pro/Max feature)
 * Returns the most actionable signals across all symbols
 */
export async function GET(request: Request) {
  try {
    const { userId, tier } = await ensureUserInitialized();

    // Check if user has access to this feature (Pro or Max only)
    if (tier === "free") {
      return NextResponse.json(
        {
          error: "Feature not available",
          message:
            "Watchlist signals summary is a Pro/Max feature. Upgrade to unlock.",
          upgradeRequired: true,
          requiredTier: "pro",
        },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const watchlistId = searchParams.get("watchlistId");

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
          topOpportunities: [],
          summary: {
            totalSymbols: 0,
            analyzed: 0,
          },
        },
      });
    }

    // Analyze all symbols and extract top signals
    const mcp = getMCPClient();
    const analysisResults = await Promise.allSettled(
      symbols.map(async (symbol: string) => {
        try {
          const analysis = await mcp.analyzeSecurity(symbol, "1mo", false);
          const signals = analysis.signals || [];

          // Calculate signal strength score
          const signalScore = signals.reduce((score: number, signal: any) => {
            const strengthMultiplier =
              signal.strength === "strong"
                ? 3
                : signal.strength === "moderate"
                  ? 2
                  : 1;
            const directionMultiplier =
              signal.direction === "bullish"
                ? 1
                : signal.direction === "bearish"
                  ? -1
                  : 0;
            return score + strengthMultiplier * directionMultiplier;
          }, 0);

          return {
            symbol,
            signalScore,
            price: analysis.price,
            priceChange: analysis.change,
            priceChangePercent: (analysis.change / analysis.price) * 100,
            signals: signals.slice(0, 5), // Top 5 signals
            totalSignals: signals.length,
          };
        } catch (error) {
          console.error(`Failed to analyze ${symbol}:`, error);
          return null;
        }
      }),
    );

    // Filter successful results and sort by signal score
    const successfulAnalysis = analysisResults
      .filter(
        (result): result is PromiseFulfilledResult<any> =>
          result.status === "fulfilled" && result.value !== null,
      )
      .map((result) => result.value)
      .sort((a, b) => Math.abs(b.signalScore) - Math.abs(a.signalScore));

    // Get top opportunities (highest absolute signal scores)
    const topOpportunities = successfulAnalysis.slice(0, 10).map((item) => ({
      symbol: item.symbol,
      sentiment: item.signalScore > 0 ? "bullish" : "bearish",
      signalStrength: Math.abs(item.signalScore),
      price: item.price,
      priceChange: item.priceChange,
      priceChangePercent: item.priceChangePercent,
      topSignals: item.signals.slice(0, 3).map((s: any) => ({
        name: s.name,
        direction: s.direction,
        strength: s.strength,
      })),
      totalSignals: item.totalSignals,
    }));

    // Group by sentiment
    const bullishOpportunities = topOpportunities.filter(
      (o) => o.sentiment === "bullish",
    );
    const bearishOpportunities = topOpportunities.filter(
      (o) => o.sentiment === "bearish",
    );

    return NextResponse.json({
      success: true,
      data: {
        watchlistId,
        watchlistName: watchlist[0].name,
        topOpportunities,
        bullishOpportunities,
        bearishOpportunities,
        summary: {
          totalSymbols: symbols.length,
          analyzed: successfulAnalysis.length,
          bullishCount: bullishOpportunities.length,
          bearishCount: bearishOpportunities.length,
        },
        tier,
      },
    });
  } catch (error) {
    console.error("Watchlist signals error:", error);
    return NextResponse.json(
      { error: "Failed to get watchlist signals" },
      { status: 500 },
    );
  }
}
