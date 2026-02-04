import { NextResponse } from "next/server";
import { getMCPClient } from "@/lib/mcp/client";
import { TIER_LIMITS, canAccessAI, isToolEnabled } from "@/lib/auth/tiers";
import { ensureUserInitialized } from "@/lib/auth/user-init";

export async function POST(request: Request) {
  try {
    // Initialize user and get their tier
    const { userId, tier } = await ensureUserInitialized();

    // Check if tool is enabled for this tier
    if (!isToolEnabled(tier, "compare_securities")) {
      return NextResponse.json(
        {
          error: "Compare securities requires Pro or higher tier",
          upgrade_required: true,
        },
        { status: 403 },
      );
    }

    const {
      symbols,
      metric = "signals",
      use_ai = false,
    } = await request.json();

    // Validate symbols
    if (!symbols || !Array.isArray(symbols) || symbols.length < 2) {
      return NextResponse.json(
        { error: "At least 2 symbols are required for comparison" },
        { status: 400 },
      );
    }

    // Get tool limits
    const toolLimits = TIER_LIMITS[tier].tools.compare_securities;
    const maxSymbols = toolLimits.maxSymbols as number;

    // Limit symbols based on tier
    const limitedSymbols = symbols.slice(0, maxSymbols);

    // Check if AI is allowed
    const canUseAi = canAccessAI(tier, "compare_securities");
    const useAiActual = use_ai && canUseAi;

    // Call MCP server
    const mcp = getMCPClient();
    const result = await mcp.compareSecurity(
      limitedSymbols,
      metric,
      useAiActual,
    );

    // Return response with tier info
    return NextResponse.json({
      ...result,
      tierLimit: {
        maxSymbols,
        ai: canUseAi,
        symbolsProvided: symbols.length,
        symbolsUsed: limitedSymbols.length,
      },
    });
  } catch (error) {
    console.error("[API /mcp/compare] Error:", error);

    if (error instanceof Error && error.message.includes("MCP API error")) {
      return NextResponse.json(
        { error: "Comparison service unavailable" },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Failed to compare securities" },
      { status: 500 },
    );
  }
}
