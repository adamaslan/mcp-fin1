import { NextResponse } from "next/server";
import { getMCPClient } from "@/lib/mcp/client";
import { TIER_LIMITS } from "@/lib/auth/tiers";
import { ensureUserInitialized } from "@/lib/auth/user-init";
import {
  checkAnalysisLimit,
  recordAnalysis,
  UsageLimitExceededError,
} from "@/lib/auth/usage-limits";
import { db } from "@/lib/db";
import { mcpRuns } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
  let runId: string | null = null;

  try {
    // Initialize user in database and get their tier
    const { userId, tier } = await ensureUserInitialized();

    // Check usage limit before processing
    await checkAnalysisLimit(userId, tier);

    const { toolName, parameters } = await request.json();

    if (!toolName || !parameters) {
      return NextResponse.json(
        { error: "Missing toolName or parameters" },
        { status: 400 },
      );
    }

    // Create run record
    runId = nanoid();
    await db.insert(mcpRuns).values({
      id: runId,
      userId,
      toolName,
      parameters: parameters as any,
      status: "running",
    });

    // Execute the appropriate MCP tool
    const startTime = Date.now();
    const mcp = getMCPClient();
    let result: any;

    switch (toolName) {
      case "analyze_security":
        result = await mcp.analyzeSecurity(
          parameters.symbol,
          parameters.period || "1mo",
          tier !== "free" && parameters.use_ai,
        );
        break;

      case "analyze_fibonacci":
        result = await mcp.analyzeFibonacci(
          parameters.symbol,
          parameters.period || "1mo",
          parameters.window || 150,
        );
        break;

      case "get_trade_plan":
        result = await mcp.getTradePlan(
          parameters.symbol,
          parameters.period || "1mo",
        );
        break;

      case "compare_securities":
        result = await mcp.compareSecurity(
          parameters.symbols,
          parameters.metric || "signals",
          tier !== "free",
        );
        break;

      case "screen_securities":
        result = await mcp.screenSecurities(
          parameters.universe || "sp500",
          parameters.criteria,
          parameters.limit || 20,
          tier !== "free",
        );
        break;

      case "scan_trades":
        result = await mcp.scanTrades(
          parameters.universe || "sp500",
          parameters.maxResults || 10,
          tier !== "free",
        );
        break;

      case "portfolio_risk":
        result = await mcp.portfolioRisk(parameters.positions, tier !== "free");
        break;

      case "morning_brief":
        result = await mcp.morningBrief(
          parameters.watchlist,
          parameters.marketRegion || "US",
          tier !== "free",
        );
        break;

      case "options_risk_analysis":
        result = await mcp.optionsRiskAnalysis(
          parameters.symbol,
          parameters.optionType || "both",
          parameters.options || [],
          tier !== "free",
        );
        break;

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }

    const executionTime = Date.now() - startTime;

    // Update run record with results
    await db
      .update(mcpRuns)
      .set({
        result: result as any,
        status: "success",
        executionTime,
      })
      .where(eq(mcpRuns.id, runId));

    // Record usage after successful execution
    const analysisCount = await recordAnalysis(userId);

    return NextResponse.json({
      success: true,
      runId,
      result,
      executionTime,
      usage: {
        analysisCount,
        limit: TIER_LIMITS[tier].analysesPerDay,
      },
    });
  } catch (error) {
    // Update run record with error
    if (runId) {
      try {
        await db
          .update(mcpRuns)
          .set({
            status: "error",
            errorMessage:
              error instanceof Error ? error.message : String(error),
          })
          .where(eq(mcpRuns.id, runId));
      } catch (dbError) {
        console.error("Failed to update error status in DB:", dbError);
      }
    }

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

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("GCloud execute error:", {
      message: errorMessage,
      stack: errorStack,
      toolName: (error as any).toolName,
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
        error: "Failed to execute tool",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    );
  }
}
