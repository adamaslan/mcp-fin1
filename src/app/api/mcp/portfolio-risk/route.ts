import { NextResponse } from "next/server";
import { getMCPClient } from "@/lib/mcp/client";
import { TIER_LIMITS, canAccessAI } from "@/lib/auth/tiers";
import { ensureUserInitialized } from "@/lib/auth/user-init";

export async function POST(request: Request) {
  try {
    // Initialize user in database and get their tier
    const { userId, tier } = await ensureUserInitialized();

    // Check if user has access to portfolio risk (Pro+)
    if (tier === "free") {
      return NextResponse.json(
        { error: "Portfolio risk is only available in Pro tier and above" },
        { status: 403 },
      );
    }

    const { positions, use_ai = false } = await request.json();

    if (!positions || !Array.isArray(positions)) {
      return NextResponse.json(
        { error: "Positions array is required" },
        { status: 400 },
      );
    }

    // Check if AI is allowed
    const canUseAi = canAccessAI(tier, "portfolio_risk");
    const useAiActual = use_ai && canUseAi;

    // Call MCP server
    const mcp = getMCPClient();
    const result = await mcp.portfolioRisk(positions, useAiActual);

    // Filter hedge suggestions for tier
    let filteredResult = { ...result };
    if (tier === "pro") {
      // Pro tier doesn't see hedge suggestions
      filteredResult.hedge_suggestions = [];
    }
    // Max tier sees everything

    return NextResponse.json({
      ...filteredResult,
      tierLimit: {
        ...TIER_LIMITS[tier],
        ai: canUseAi,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Portfolio risk API error:", {
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
            "Portfolio risk service unavailable. Please ensure the MCP server is running.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to calculate portfolio risk",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    );
  }
}
