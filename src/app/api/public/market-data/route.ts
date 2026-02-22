import { NextResponse } from "next/server";
import { getMCPClient } from "@/lib/mcp/client";

/**
 * Public endpoint for landing page market data
 * No authentication required - returns aggregated market overview
 * Returns 503 on backend error - NO MOCK DATA EVER
 *
 * Featured tickers: MU, SNDK, GLD, GLW, GOOG, IBIT
 */

const FEATURED_WATCHLIST = ["MU", "SNDK", "GLD", "GLW", "GOOG", "IBIT"];

export async function GET(): Promise<NextResponse> {
  try {
    const mcp = getMCPClient();

    // Fetch all data in parallel, allowing partial failures
    const [morningBriefResult, comparisonResult, sampleAnalysisResult] =
      await Promise.allSettled([
        mcp.morningBrief(FEATURED_WATCHLIST, "US"),
        mcp.compareSecurity(FEATURED_WATCHLIST, "signals"),
        mcp.analyzeSecurity("GOOG", "3mo"),
      ]);

    // Extract results with graceful fallbacks
    const morningBrief =
      morningBriefResult.status === "fulfilled"
        ? morningBriefResult.value
        : null;

    const comparisonRaw =
      comparisonResult.status === "fulfilled"
        ? comparisonResult.value
        : null;

    const sampleAnalysis =
      sampleAnalysisResult.status === "fulfilled"
        ? sampleAnalysisResult.value
        : null;

    // Extract comparison array from either field name
    const comparisonData =
      (comparisonRaw as any)?.comparison ||
      (comparisonRaw as any)?.comparisons ||
      [];

    // At least one data source must succeed
    if (!morningBrief && !comparisonRaw && !sampleAnalysis) {
      return NextResponse.json(
        {
          success: false,
          timestamp: new Date().toISOString(),
          error: "All market data sources unavailable",
          data: null,
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        market: {
          status: morningBrief?.market_status?.market_status ?? "unknown",
          futuresES:
            morningBrief?.market_status?.futures_es?.change_percent ?? 0,
          futuresNQ:
            morningBrief?.market_status?.futures_nq?.change_percent ?? 0,
          vix: morningBrief?.market_status?.vix ?? 0,
          economicEvents:
            morningBrief?.economic_events?.slice(0, 3) || [],
          sectorLeaders:
            morningBrief?.sector_leaders?.slice(0, 3) || [],
          sectorLosers:
            morningBrief?.sector_losers?.slice(0, 3) || [],
          keyThemes: morningBrief?.key_themes?.slice(0, 3) || [],
        },
        featuredTickers: FEATURED_WATCHLIST,
        comparison: comparisonData,
        sampleAnalysis: sampleAnalysis
          ? {
              symbol: sampleAnalysis.symbol || "GOOG",
              signals: sampleAnalysis.signals?.slice(0, 5) || [],
              summary: sampleAnalysis.summary,
              indicators: sampleAnalysis.indicators,
              price: sampleAnalysis.price,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Failed to fetch market data:", error);

    // Return 503 error - NO MOCK DATA FALLBACK
    return NextResponse.json(
      {
        success: false,
        timestamp: new Date().toISOString(),
        error:
          "Market data service unavailable. Please check MCP backend connection.",
        details: error instanceof Error ? error.message : "Unknown error",
        data: null,
      },
      { status: 503 },
    );
  }
}

// Revalidate every 2 minutes for ISR (Incremental Static Regeneration)
export const revalidate = 120;
