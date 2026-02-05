import { NextResponse } from "next/server";
import { getMCPClient } from "@/lib/mcp/client";
import { TIER_LIMITS, canAccessAI, isToolEnabled } from "@/lib/auth/tiers";
import { ensureUserInitialized } from "@/lib/auth/user-init";

export async function POST(request: Request) {
  try {
    // Initialize user and get their tier
    const { userId, tier } = await ensureUserInitialized();

    // Check if tool is enabled for this tier
    if (!isToolEnabled(tier, "options_risk_analysis")) {
      return NextResponse.json(
        {
          error: "Options analysis requires Pro or higher tier",
          upgrade_required: true,
        },
        { status: 403 },
      );
    }

    const {
      symbol,
      position_type,
      strike,
      expiry,
      contracts = 1,
      premium,
      use_ai = false,
    } = await request.json();

    // Validate required fields
    if (!symbol) {
      return NextResponse.json(
        { error: "Symbol is required" },
        { status: 400 },
      );
    }

    if (!position_type || !["call", "put", "spread"].includes(position_type)) {
      return NextResponse.json(
        { error: "Valid position_type (call, put, spread) is required" },
        { status: 400 },
      );
    }

    // Get tool limits
    const toolLimits = TIER_LIMITS[tier].tools.options_risk_analysis;

    // Check if AI is allowed
    const canUseAi = canAccessAI(tier, "options_risk_analysis");
    const useAiActual = use_ai && canUseAi;

    // Build options parameters
    const options: {
      strike?: number;
      expiry?: string;
      contracts?: number;
      premium?: number;
    } = {};

    if (strike) options.strike = strike;
    if (expiry) options.expiry = expiry;
    if (contracts) options.contracts = contracts;
    if (premium) options.premium = premium;

    // Call MCP server
    const mcp = getMCPClient();
    const result = await mcp.optionsRiskAnalysis(
      symbol,
      position_type,
      options,
      useAiActual,
    );

    // Apply tier-based filtering for scenarios
    let filteredScenarios = result.scenarios || [];
    let scenariosLimit = 5; // Default for pro and free

    if (tier === "pro" || tier === "free") {
      // Pro and Free tiers: limit to 5 scenarios
      filteredScenarios = filteredScenarios.slice(0, 5);
      scenariosLimit = 5;
    }
    // Max tier: all scenarios (no filtering)
    if (tier === "max") {
      scenariosLimit = Infinity;
    }

    // Return response with tier info
    return NextResponse.json({
      ...result,
      scenarios: filteredScenarios,
      tierLimit: {
        ai: canUseAi,
        scenariosAvailable: scenariosLimit,
        strategiesAvailable: tier === "max" ? ["all"] : ["basic"],
      },
    });
  } catch (error) {
    console.error("[API /mcp/options-risk] Error:", error);

    if (error instanceof Error && error.message.includes("MCP API error")) {
      return NextResponse.json(
        { error: "Options analysis service unavailable" },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Failed to analyze options risk" },
      { status: 500 },
    );
  }
}
