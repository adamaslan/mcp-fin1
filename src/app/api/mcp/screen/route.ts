import { NextResponse } from "next/server";
import { getMCPClient } from "@/lib/mcp/client";
import { TIER_LIMITS, canAccessAI, isToolEnabled } from "@/lib/auth/tiers";
import { ensureUserInitialized } from "@/lib/auth/user-init";

export async function POST(request: Request) {
  try {
    // Initialize user and get their tier
    const { userId, tier } = await ensureUserInitialized();

    // Check if tool is enabled for this tier
    if (!isToolEnabled(tier, "screen_securities")) {
      return NextResponse.json(
        {
          error: "Screen securities requires Free or higher tier",
          upgrade_required: false,
        },
        { status: 403 },
      );
    }

    const {
      universe = "sp500",
      criteria = {},
      limit = 20,
      use_ai = false,
    } = await request.json();

    // Validate criteria
    if (!criteria || typeof criteria !== "object") {
      return NextResponse.json(
        { error: "Screening criteria must be an object" },
        { status: 400 },
      );
    }

    // Get tool limits
    const toolLimits = TIER_LIMITS[tier].tools.screen_securities;

    // Check if AI is allowed
    const canUseAi = canAccessAI(tier, "screen_securities");
    const useAiActual = use_ai && canUseAi;

    // Call MCP server
    const mcp = getMCPClient();
    const result = await mcp.screenSecurities(
      universe,
      criteria,
      limit,
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
    console.error("[API /mcp/screen] Error:", error);

    if (error instanceof Error && error.message.includes("MCP API error")) {
      return NextResponse.json(
        { error: "Screening service unavailable" },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Failed to screen securities" },
      { status: 500 },
    );
  }
}
