import { NextResponse } from "next/server";
import { getMCPClient } from "@/lib/mcp/client";

/**
 * Public endpoint for landing page market data
 * No authentication required - returns aggregated market overview
 * Returns 503 on backend error - NO MOCK DATA EVER
 */
export async function GET() {
  try {
    const mcp = getMCPClient();

    // Fetch morning brief for market overview (includes futures, VIX, economic events, sectors)
    const defaultWatchlist = ["SPY", "QQQ", "DIA", "IWM"];
    const morningBrief = await mcp.morningBrief(defaultWatchlist, "US");

    // Fetch top trades from S&P 500
    const topTrades = await mcp.scanTrades("sp500", 10);

    // Fetch a sample analysis for SPY visibility
    const sampleAnalysis = await mcp.analyzeSecurity("SPY", "1d");

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        market: {
          status: morningBrief.market_status.market_status,
          futuresES: morningBrief.market_status.futures_es.change_percent,
          futuresNQ: morningBrief.market_status.futures_nq.change_percent,
          vix: morningBrief.market_status.vix,
          economicEvents: morningBrief.economic_events?.slice(0, 3) || [],
          sectorLeaders: morningBrief.sector_leaders?.slice(0, 3) || [],
          sectorLosers: morningBrief.sector_losers?.slice(0, 3) || [],
          keyThemes: morningBrief.key_themes?.slice(0, 3) || [],
        },
        topTrades: topTrades.qualified_trades?.slice(0, 5) || [],
        sampleAnalysis: {
          symbol: "SPY",
          signals: sampleAnalysis.signals?.slice(0, 3) || [],
          summary: sampleAnalysis.summary,
          indicators: sampleAnalysis.indicators,
        },
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
