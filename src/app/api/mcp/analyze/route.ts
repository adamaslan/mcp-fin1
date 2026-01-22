import { NextResponse } from "next/server";
import { getMCPClient } from "@/lib/mcp/client";
import { TIER_LIMITS } from "@/lib/auth/tiers";
import { ensureUserInitialized } from "@/lib/auth/user-init";
import {
  checkAnalysisLimit,
  recordAnalysis,
  UsageLimitExceededError,
} from "@/lib/auth/usage-limits";

export async function POST(request: Request) {
  try {
    // Initialize user in database and get their tier
    const { userId, tier } = await ensureUserInitialized();

    // Check usage limit before processing
    await checkAnalysisLimit(userId, tier);

    const { symbol, period = "1mo", useAi = false } = await request.json();

    if (!symbol) {
      return NextResponse.json(
        { error: "Symbol is required" },
        { status: 400 },
      );
    }

    // Call MCP server
    const mcp = getMCPClient();
    const result = await mcp.analyzeSecurity(symbol, period, useAi);

    // Record usage after successful analysis
    const analysisCount = await recordAnalysis(userId);

    // Filter signals based on tier
    let filteredSignals = result.signals || [];
    if (tier === "free") {
      // Free users see only top 3 signals
      filteredSignals = filteredSignals.slice(0, 3);
    } else if (tier === "pro") {
      // Pro users see top 10 signals
      filteredSignals = filteredSignals.slice(0, 10);
    }
    // Max users see all signals (no filtering)

    return NextResponse.json({
      ...result,
      signals: filteredSignals,
      tierLimit: TIER_LIMITS[tier],
      usage: {
        analysisCount,
        limit: TIER_LIMITS[tier].analysesPerDay,
      },
    });
  } catch (error) {
    if (error instanceof UsageLimitExceededError) {
      return NextResponse.json(
        {
          error: `${error.feature} limit exceeded`,
          message: error.message,
          current: error.current,
          limit: error.limit,
        },
        { status: 429 },
      );
    }

    console.error("Analyze API error:", error);
    return NextResponse.json(
      { error: "Failed to analyze security" },
      { status: 500 },
    );
  }
}
