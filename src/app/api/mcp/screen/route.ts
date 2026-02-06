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
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("[API /mcp/screen] Error:", {
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
            "Screening service unavailable. Please ensure the MCP server is running.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to screen securities",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    );
  }
}
