import { NextResponse } from "next/server";
import { getMCPClient } from "@/lib/mcp/client";
import { TIER_LIMITS, canAccessAI, isToolEnabled } from "@/lib/auth/tiers";
import { ensureUserInitialized } from "@/lib/auth/user-init";

export async function POST(request: Request) {
  try {
    // Initialize user and get their tier
    const { userId, tier } = await ensureUserInitialized();

    // Check if tool is enabled for this tier
    if (!isToolEnabled(tier, "morning_brief")) {
      return NextResponse.json(
        {
          error: "Morning brief requires Free or higher tier",
          upgrade_required: false,
        },
        { status: 403 },
      );
    }

    const {
      symbols = ["SPY", "QQQ", "AAPL"],
      region = "US",
      use_ai = false,
    } = await request.json();

    // Validate symbols
    if (!Array.isArray(symbols) || symbols.length === 0) {
      return NextResponse.json(
        { error: "At least one symbol is required" },
        { status: 400 },
      );
    }

    // Get tool limits
    const toolLimits = TIER_LIMITS[tier].tools.morning_brief;

    // Check if AI is allowed
    const canUseAi = canAccessAI(tier, "morning_brief");
    const useAiActual = use_ai && canUseAi;

    // Call MCP server
    const mcp = getMCPClient();
    const result = await mcp.morningBrief(
      symbols || undefined,
      region,
      useAiActual,
    );

    // Return response with tier info
    return NextResponse.json({
      ...result,
      tierLimit: {
        daily: (toolLimits as any).daily,
        ai: canUseAi,
      },
    });
  } catch (error) {
    console.error("[API /mcp/morning-brief] Error:", error);

    if (error instanceof Error && error.message.includes("MCP API error")) {
      return NextResponse.json(
        { error: "Morning brief service unavailable" },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch morning brief" },
      { status: 500 },
    );
  }
}
