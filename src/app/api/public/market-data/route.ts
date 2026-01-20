import { NextResponse } from "next/server";
import { getMCPClient } from "@/lib/mcp/client";

/**
 * Public endpoint for landing page market data
 * No authentication required - returns aggregated market overview
 */
export async function GET() {
  try {
    const mcp = getMCPClient();

    // Fetch morning brief for market overview (includes futures, VIX, economic events)
    const morningBrief = await mcp.morningBrief([], "us");

    // Fetch top trades from S&P 500
    const topTrades = await mcp.scanTrades("sp500", 10);

    // Fetch a sample analysis (most active stock for visibility)
    const sampleAnalysis = await mcp.analyzeSecurity("SPY", "1d");

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        market: {
          status: morningBrief.market_status,
          futuresES: morningBrief.es_change,
          futuresNQ: morningBrief.nq_change,
          vix: morningBrief.vix,
          economicEvents: morningBrief.economic_events || [],
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

    // Return fallback data on error
    return NextResponse.json(
      {
        success: false,
        timestamp: new Date().toISOString(),
        error: "Failed to fetch market data",
        data: {
          market: {
            status: "UNKNOWN",
            futuresES: 0,
            futuresNQ: 0,
            vix: 0,
            economicEvents: [],
          },
          topTrades: [],
          sampleAnalysis: {
            symbol: "SPY",
            signals: [],
            summary: { bullish: 0, bearish: 0, neutral: 0 },
            indicators: {},
          },
        },
      },
      { status: 503 },
    );
  }
}

// Revalidate every 2 minutes for ISR (Incremental Static Regeneration)
export const revalidate = 120;
