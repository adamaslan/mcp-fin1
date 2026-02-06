import { NextResponse } from "next/server";
import { getMCPClient } from "@/lib/mcp/client";
import { ensureUserInitialized } from "@/lib/auth/user-init";
import { TIER_LIMITS, canAccessAI } from "@/lib/auth/tiers";
import {
  checkAnalysisLimit,
  recordAnalysis,
  UsageLimitExceededError,
} from "@/lib/auth/usage-limits";
import type {
  FibonacciAnalysisResult,
  FibonacciLevel,
  FibonacciSignal,
} from "@/lib/mcp/types";

export async function POST(request: Request) {
  try {
    // 1. Authentication
    const { userId, tier } = await ensureUserInitialized();

    // 2. Usage limit check (counts as an analysis)
    await checkAnalysisLimit(userId, tier);

    // 3. Parse request
    const {
      symbol,
      period = "1d",
      window = 50,
      use_ai = false,
    } = await request.json();

    if (!symbol) {
      return NextResponse.json({ error: "Symbol required" }, { status: 400 });
    }

    // 3.5 Check if AI is allowed
    const canUseAi = canAccessAI(tier, "analyze_fibonacci");
    const useAiActual = use_ai && canUseAi;

    // 4. Call MCP for Fibonacci analysis
    const mcp = getMCPClient();
    const result: FibonacciAnalysisResult = await mcp.analyzeFibonacci(
      symbol,
      period,
      window,
      useAiActual,
    );

    // 5. Filter by tier limits
    const tierLimits = TIER_LIMITS[tier];

    // Filter levels
    let filteredLevels = result.levels;
    if (tier === "free") {
      // Free tier: only basic levels
      filteredLevels = result.levels.filter((l: FibonacciLevel) =>
        Array.isArray(tierLimits.fibonacciLevels)
          ? tierLimits.fibonacciLevels.includes(l.key)
          : false,
      );
    } else if (tier === "pro") {
      // Pro tier: retracements and extensions only
      if (tierLimits.fibonacciLevels === "all_retracements_extensions") {
        filteredLevels = result.levels.filter(
          (l: FibonacciLevel) => l.type === "RETRACE" || l.type === "EXTENSION",
        );
      }
    }
    // Max tier: all levels (no filtering)

    // Filter signals by category
    let filteredSignals = result.signals;
    if (tierLimits.fibonacciCategories !== "all") {
      filteredSignals = filteredSignals.filter((s: FibonacciSignal) =>
        Array.isArray(tierLimits.fibonacciCategories)
          ? tierLimits.fibonacciCategories.includes(s.category)
          : false,
      );
    }

    // Limit signal count
    filteredSignals = filteredSignals.slice(
      0,
      tierLimits.fibonacciSignalsLimit,
    );

    // 6. Record usage
    const analysisCount = await recordAnalysis(userId);

    // 7. Return response
    return NextResponse.json({
      ...result,
      levels: filteredLevels,
      signals: filteredSignals,
      tierLimit: {
        levelsAvailable: filteredLevels.length,
        categoriesAvailable:
          tierLimits.fibonacciCategories === "all"
            ? "all"
            : Array.isArray(tierLimits.fibonacciCategories)
              ? tierLimits.fibonacciCategories.length
              : 0,
        signalsShown: filteredSignals.length,
        signalsTotal: result.signals.length,
        ai: canUseAi,
      },
      usage: {
        analysisCount,
        limit: tierLimits.analysesPerDay,
      },
    });
  } catch (error) {
    if (error instanceof UsageLimitExceededError) {
      return NextResponse.json(
        {
          error: error.message,
          current: error.current,
          limit: error.limit,
        },
        { status: 429 },
      );
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Fibonacci analysis error:", {
      message: errorMessage,
      stack: errorStack,
    });

    // Check if it's an MCP connection error
    if (
      errorMessage.includes("MCP API error") ||
      errorMessage.includes("ECONNREFUSED")
    ) {
      return NextResponse.json(
        {
          error: "MCP server error",
          details: errorMessage,
          message:
            "Unable to connect to the analysis server. Please ensure the MCP server is running.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        error: "Analysis failed",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    );
  }
}
