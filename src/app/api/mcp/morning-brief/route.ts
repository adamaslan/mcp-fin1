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
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("[API /mcp/morning-brief] Error:", {
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
            "Morning brief service unavailable. Please ensure the MCP server is running.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch morning brief",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    );
  }
}
