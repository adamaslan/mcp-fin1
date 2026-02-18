import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { publicLatestRuns } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

/**
 * GET /api/dashboard/latest-runs
 *
 * Public endpoint (no authentication required) that returns the latest run data
 * for all 9 MCP tools. Used by the landing page to display cached analysis results.
 *
 * This endpoint serves cached data and should be updated periodically by a
 * background job or cron task that executes each tool and updates the cache.
 */
export async function GET(request: Request) {
  try {
    // Fetch latest runs for all 9 tools
    const runs = await db
      .select()
      .from(publicLatestRuns)
      .orderBy(desc(publicLatestRuns.updatedAt))
      .limit(9);

    // Group by tool name for easier frontend consumption
    const runsMap: Record<string, any> = {};
    runs.forEach((run) => {
      runsMap[run.toolName] = {
        toolName: run.toolName,
        symbol: run.symbol,
        result: run.result,
        updatedAt: run.updatedAt,
      };
    });

    return NextResponse.json({
      success: true,
      runs: runs,
      runsMap: runsMap,
      count: runs.length,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Latest runs GET error:", { message: errorMessage });

    // Return empty results instead of error for better UX on landing page
    return NextResponse.json({
      success: false,
      runs: [],
      runsMap: {},
      count: 0,
      lastUpdated: new Date().toISOString(),
      error: "Unable to fetch latest runs",
    });
  }
}

/**
 * POST /api/dashboard/latest-runs
 *
 * Internal endpoint for updating the cached latest runs.
 * Should be called by a cron job after executing each tool.
 *
 * Body:
 * {
 *   toolName: string,
 *   symbol: string,
 *   result: object
 * }
 */
export async function POST(request: Request) {
  try {
    // Verify internal request (could add API key check here)
    const authHeader = request.headers.get("x-internal-api-key");
    const internalKey = process.env.INTERNAL_API_KEY;

    if (internalKey && authHeader !== internalKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { toolName, symbol, result } = await request.json();

    if (!toolName || !result) {
      return NextResponse.json(
        { error: "Missing toolName or result" },
        { status: 400 },
      );
    }

    // Upsert the latest run for this tool
    const existingRun = await db
      .select()
      .from(publicLatestRuns)
      .where((t) => t.toolName === toolName)
      .limit(1);

    let updated;
    if (existingRun.length > 0) {
      // Update existing
      updated = await db
        .update(publicLatestRuns)
        .set({
          symbol: symbol || existingRun[0].symbol,
          result: result as any,
          updatedAt: new Date(),
        })
        .where((t) => t.toolName === toolName)
        .returning();
    } else {
      // Insert new
      const nanoid = (await import("nanoid")).nanoid;
      updated = await db
        .insert(publicLatestRuns)
        .values({
          id: nanoid(),
          toolName,
          symbol: symbol || null,
          result: result as any,
        })
        .returning();
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${toolName}`,
      run: updated[0],
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Latest runs POST error:", { message: errorMessage });

    return NextResponse.json(
      { error: "Failed to update latest run", details: errorMessage },
      { status: 500 },
    );
  }
}
