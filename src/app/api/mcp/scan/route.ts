import { NextResponse } from "next/server";
import { getMCPClient } from "@/lib/mcp/client";
import { canAccessUniverse, TIER_LIMITS } from "@/lib/auth/tiers";
import { ensureUserInitialized } from "@/lib/auth/user-init";
import {
  checkScanLimit,
  recordScan,
  UsageLimitExceededError,
} from "@/lib/auth/usage-limits";

export async function POST(request: Request) {
  try {
    // Initialize user in database and get their tier
    const { userId, tier } = await ensureUserInitialized();

    // Check usage limit before processing
    await checkScanLimit(userId, tier);

    const { universe = "sp500", maxResults = 10 } = await request.json();

    // Check if user can access this universe
    if (!canAccessUniverse(tier, universe)) {
      return NextResponse.json(
        { error: `${universe} universe not available in ${tier} tier` },
        { status: 403 },
      );
    }

    const tierLimits = TIER_LIMITS[tier];
    const resultsLimit = tierLimits.scanResultsLimit;

    // Call MCP server
    const mcp = getMCPClient();
    const result = await mcp.scanTrades(
      universe,
      Math.min(maxResults, resultsLimit),
    );

    // Record usage after successful scan
    const scanCount = await recordScan(userId);

    // Limit results based on tier
    const limitedTrades = result.qualified_trades?.slice(0, resultsLimit) || [];

    return NextResponse.json({
      ...result,
      qualified_trades: limitedTrades,
      tierLimit: tierLimits,
      resultsLimited: result.qualified_trades?.length > resultsLimit,
      usage: {
        scanCount,
        limit: TIER_LIMITS[tier].scansPerDay,
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

    console.error("Scan API error:", error);
    return NextResponse.json(
      { error: "Failed to scan trades" },
      { status: 500 },
    );
  }
}
