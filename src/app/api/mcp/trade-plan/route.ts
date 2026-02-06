import { NextResponse } from "next/server";
import { getMCPClient } from "@/lib/mcp/client";
import { canAccessTimeframe, canAccessAI, TIER_LIMITS } from "@/lib/auth/tiers";
import { ensureUserInitialized } from "@/lib/auth/user-init";
import type { TradePlan } from "@/lib/mcp/types";

export async function POST(request: Request) {
  try {
    // Initialize user in database and get their tier
    const { userId, tier } = await ensureUserInitialized();

    const { symbol, period = "1mo", use_ai = false } = await request.json();

    if (!symbol) {
      return NextResponse.json(
        { error: "Symbol is required" },
        { status: 400 },
      );
    }

    // Check if AI is allowed
    const canUseAi = canAccessAI(tier, "get_trade_plan");
    const useAiActual = use_ai && canUseAi;

    // Call MCP server
    const mcp = getMCPClient();
    const result = await mcp.getTradePlan(symbol, period, useAiActual);

    // Filter trade plans based on timeframe access
    let filteredPlans = (result.trade_plans || []) as TradePlan[];
    if (tier === "free") {
      // Free users only see swing trades
      filteredPlans = filteredPlans.filter(
        (p: TradePlan) => p.timeframe === "swing",
      );
    } else if (tier === "pro") {
      // Pro users see swing, day, and scalp
      filteredPlans = filteredPlans.filter((p: TradePlan) =>
        canAccessTimeframe(tier, p.timeframe),
      );
    }
    // Max users see all timeframes (no filtering)

    return NextResponse.json({
      ...result,
      trade_plans: filteredPlans,
      has_trades: filteredPlans.length > 0,
      tierLimit: {
        ...TIER_LIMITS[tier],
        ai: canUseAi,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Trade plan API error:", {
      message: errorMessage,
      stack: errorStack,
    });

    if (
      errorMessage.includes("MCP API error") ||
      errorMessage.includes("ECONNREFUSED")
    ) {
      return NextResponse.json(
        {
          error: "MCP server error",
          message:
            "Trade plan service unavailable. Please ensure the MCP server is running.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to get trade plan",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    );
  }
}
