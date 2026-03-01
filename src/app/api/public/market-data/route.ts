import { NextResponse } from "next/server";
import { getMCPClient } from "@/lib/mcp/client";
import { getDb } from "@/lib/firebase/admin";
import type { PortfolioRiskData } from "@/lib/firebase/types";
import {
  readMarketSnapshot,
  writeMarketSnapshot,
  readPortfolioSignals,
  type SignalEntry,
} from "@/lib/firebase/landing-cache";

/**
 * Public endpoint for landing page market data.
 * No authentication required — returns aggregated market overview.
 * Returns 503 only if ALL sources (MCP + Firestore cache) are unavailable.
 *
 * Data priority:
 *  1. Signal scores for portfolio symbols  →  Firestore `signals` collection
 *     (written continuously by the Python MCP backend)
 *  2. Trade plan / analysis / morning brief →  live MCP calls on the winner
 *  3. If MCP is completely offline          →  serve `demo/market_snapshot`
 *     (written here after every successful batch of MCP calls)
 */

const FEATURED_WATCHLIST = ["MU", "SNDK", "GLD", "GLW", "GOOG", "IBIT"];

// ---------------------------------------------------------------------------
// Firestore helpers
// ---------------------------------------------------------------------------

/** Top 10 portfolio positions by current_value, fallback to FEATURED_WATCHLIST. */
async function getPortfolioSymbols(): Promise<string[]> {
  try {
    const db = getDb();
    const snap = await db.collection("demo").doc("portfolio_risk").get();
    if (!snap.exists) return FEATURED_WATCHLIST;

    const data = snap.data() as PortfolioRiskData;
    if (!data.positions || data.positions.length === 0)
      return FEATURED_WATCHLIST;

    const sorted = [...data.positions].sort(
      (a, b) => b.current_value - a.current_value,
    );
    return sorted.slice(0, 10).map((p) => p.symbol);
  } catch {
    return FEATURED_WATCHLIST;
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(): Promise<NextResponse> {
  try {
    const mcp = getMCPClient();

    // ------------------------------------------------------------------
    // Phase 0: Resolve portfolio symbols + read signal scores from
    //          Firestore `signals` collection.
    // ------------------------------------------------------------------
    const portfolioSymbols = await getPortfolioSymbols();
    // readPortfolioSignals returns [] silently if the collection is empty
    const firestoreSignals = await readPortfolioSignals(portfolioSymbols);

    // ------------------------------------------------------------------
    // Phase 1: MCP calls — morning brief + comparison in parallel.
    //          If the signals collection already has scores for these
    //          symbols, the comparison result supplements (not replaces) it.
    // ------------------------------------------------------------------
    const [morningBriefResult, mcpComparisonResult] = await Promise.allSettled([
      mcp.morningBrief(portfolioSymbols, "US"),
      mcp.compareSecurity(portfolioSymbols, "signals"),
    ]);

    const morningBrief =
      morningBriefResult.status === "fulfilled"
        ? morningBriefResult.value
        : null;

    const mcpComparisonRaw =
      mcpComparisonResult.status === "fulfilled"
        ? mcpComparisonResult.value
        : null;

    const mcpComparisonData: any[] =
      (mcpComparisonRaw as any)?.comparison ||
      (mcpComparisonRaw as any)?.comparisons ||
      [];

    // Merge: prefer Firestore signal scores (from Python backend) because
    // they include AI scoring; fill in MCP results for symbols not yet in
    // the signals collection.
    const mergedComparison: SignalEntry[] = (() => {
      if (firestoreSignals.length > 0) {
        // Build a set of symbols already covered by Firestore
        const covered = new Set(firestoreSignals.map((e) => e.symbol));
        // Add any MCP comparison entries not in Firestore
        const extras: SignalEntry[] = mcpComparisonData
          .filter((e: any) => !covered.has(e.symbol))
          .map((e: any) => ({
            symbol: e.symbol,
            score: e.score ?? 0,
            bullish: e.bullish ?? 0,
            bearish: e.bearish ?? 0,
            price: e.price ?? 0,
            change: e.change ?? 0,
          }));
        return [...firestoreSignals, ...extras].sort(
          (a, b) => b.score - a.score,
        );
      }
      // No Firestore signals — use MCP comparison data directly
      return mcpComparisonData.map((e: any) => ({
        symbol: e.symbol,
        score: e.score ?? 0,
        bullish: e.bullish ?? 0,
        bearish: e.bearish ?? 0,
        price: e.price ?? 0,
        change: e.change ?? 0,
      }));
    })();

    // Winner = highest signal score from merged set
    const winnerSymbol =
      mergedComparison[0]?.symbol ??
      (mcpComparisonRaw as any)?.winner?.symbol ??
      portfolioSymbols[0] ??
      "GOOG";

    // ------------------------------------------------------------------
    // Phase 2: MCP calls for the winner — analysis + fibonacci + trade plan
    // ------------------------------------------------------------------
    const [analysisResult, fibResult, tradePlanResult] =
      await Promise.allSettled([
        mcp.analyzeSecurity(winnerSymbol, "3mo"),
        mcp.analyzeFibonacci(winnerSymbol, "3mo"),
        mcp.getTradePlan(winnerSymbol, "1mo"),
      ]);

    const sampleAnalysisRaw =
      analysisResult.status === "fulfilled" ? analysisResult.value : null;
    const fibonacciRaw =
      fibResult.status === "fulfilled" ? fibResult.value : null;
    const tradePlanRaw =
      tradePlanResult.status === "fulfilled" ? tradePlanResult.value : null;
    const topTradePlan =
      tradePlanRaw?.has_trades && tradePlanRaw.trade_plans.length > 0
        ? tradePlanRaw.trade_plans[0]
        : null;

    const mcpHasData =
      morningBrief ||
      mcpComparisonRaw ||
      sampleAnalysisRaw ||
      firestoreSignals.length > 0;

    // ------------------------------------------------------------------
    // Phase 3: If MCP is completely offline AND no Firestore signals,
    //          serve the cached market_snapshot.
    // ------------------------------------------------------------------
    if (!mcpHasData) {
      const cached = await readMarketSnapshot();
      if (cached) {
        return NextResponse.json({
          success: true,
          timestamp: cached.updatedAt,
          fromCache: true,
          data: {
            market: cached.market,
            portfolioSymbols: cached.portfolioSymbols,
            comparison: cached.comparison,
            sampleAnalysis: cached.sampleAnalysis,
            fibonacci: cached.fibonacci,
            tradePlan: cached.tradePlan,
          },
        });
      }

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

    // ------------------------------------------------------------------
    // Phase 4: Build response
    // ------------------------------------------------------------------
    const sampleAnalysis = sampleAnalysisRaw
      ? {
          symbol: sampleAnalysisRaw.symbol || winnerSymbol,
          signals: sampleAnalysisRaw.signals?.slice(0, 5) || [],
          summary: {
            bullish: sampleAnalysisRaw.summary?.bullish ?? 0,
            bearish: sampleAnalysisRaw.summary?.bearish ?? 0,
            neutral:
              (sampleAnalysisRaw.summary?.total_signals ?? 0) -
              (sampleAnalysisRaw.summary?.bullish ?? 0) -
              (sampleAnalysisRaw.summary?.bearish ?? 0),
          },
          indicators: sampleAnalysisRaw.indicators,
          price: sampleAnalysisRaw.price,
        }
      : null;

    const fibonacci = fibonacciRaw
      ? {
          symbol: fibonacciRaw.symbol,
          price: fibonacciRaw.price,
          levels: fibonacciRaw.levels?.slice(0, 5) || [],
          signals: fibonacciRaw.signals?.slice(0, 5) || [],
          clusters: fibonacciRaw.clusters?.slice(0, 3) || [],
          summary: fibonacciRaw.summary,
        }
      : null;

    // Always include tradePlan with winnerSymbol so the UI shows the correct
    // ticker even when MCP is offline (prices will be null → "—").
    const tradePlan = {
      symbol: winnerSymbol,
      entry_price: topTradePlan?.entry_price ?? null,
      stop_price: topTradePlan?.stop_price ?? null,
      target_price: topTradePlan?.target_price ?? null,
      risk_reward_ratio: topTradePlan?.risk_reward_ratio ?? null,
      bias: topTradePlan?.bias ?? null,
      timeframe: topTradePlan?.timeframe ?? null,
      risk_quality: topTradePlan?.risk_quality ?? null,
      primary_signal: topTradePlan?.primary_signal ?? null,
    };

    const market = morningBrief
      ? {
          status: morningBrief.market_status?.market_status ?? "unknown",
          futuresES:
            morningBrief.market_status?.futures_es?.change_percent ?? 0,
          futuresNQ:
            morningBrief.market_status?.futures_nq?.change_percent ?? 0,
          vix: morningBrief.market_status?.vix ?? 0,
          economicEvents: morningBrief.economic_events?.slice(0, 3) || [],
          sectorLeaders: morningBrief.sector_leaders?.slice(0, 3) || [],
          sectorLosers: morningBrief.sector_losers?.slice(0, 3) || [],
          keyThemes: morningBrief.key_themes?.slice(0, 3) || [],
        }
      : null;

    const responseData = {
      market,
      portfolioSymbols,
      comparison: mergedComparison,
      sampleAnalysis,
      fibonacci,
      tradePlan,
    };

    // ------------------------------------------------------------------
    // Phase 5: Write to Firestore cache (non-blocking, non-fatal).
    //          This persists the latest MCP results so the next ISR cycle
    //          can serve from cache if MCP is temporarily unavailable.
    // ------------------------------------------------------------------
    writeMarketSnapshot({
      winnerSymbol,
      portfolioSymbols,
      comparison: mergedComparison,
      tradePlan,
      sampleAnalysis,
      fibonacci,
      market,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: responseData,
    });
  } catch (error) {
    console.error("Failed to fetch market data:", error);

    // Last resort: serve from Firestore cache
    const cached = await readMarketSnapshot().catch(() => null);
    if (cached) {
      return NextResponse.json({
        success: true,
        timestamp: cached.updatedAt,
        fromCache: true,
        data: {
          market: cached.market,
          portfolioSymbols: cached.portfolioSymbols,
          comparison: cached.comparison,
          sampleAnalysis: cached.sampleAnalysis,
          fibonacci: cached.fibonacci,
          tradePlan: cached.tradePlan,
        },
      });
    }

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

// Revalidate every 5 minutes — aligned with backend Firestore cache TTL (300s)
export const revalidate = 300;
