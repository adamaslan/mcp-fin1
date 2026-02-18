import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { publicLatestRuns } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { isAllowedIP, getClientIP } from "@/lib/auth/ip-allowlist";
import { verifyBearerToken } from "@/lib/auth/service-tokens";

/**
 * GET /api/dashboard/latest-runs
 *
 * Public endpoint (no authentication required) that returns the latest run data
 * for all 9 MCP tools. Used by the landing page to display cached analysis results.
 *
 * This endpoint serves cached data and should be updated periodically by a
 * background job or cron task that executes each tool and updates the cache.
 *
 * CACHING STRATEGY:
 * - CDN cache (s-maxage): 5 minutes — fresh data for most users
 * - Stale-while-revalidate: 60 seconds — serve stale data while fetching new in background
 * - Browser cache: public, 60 seconds — users get cached responses
 *
 * Result: Most requests hit CDN/browser cache (~10-30ms), DB queries only every 5 min
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
    runs.forEach((run: any) => {
      runsMap[run.toolName] = {
        toolName: run.toolName,
        symbol: run.symbol,
        result: run.result,
        updatedAt: run.updatedAt,
      };
    });

    const response = NextResponse.json({
      success: true,
      runs: runs,
      runsMap: runsMap,
      count: runs.length,
      lastUpdated: new Date().toISOString(),
    });

    // Add cache headers for optimal CDN performance
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=60",
    );

    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Latest runs GET error:", { message: errorMessage });

    // Return empty results instead of error for better UX on landing page
    const errorResponse = NextResponse.json({
      success: false,
      runs: [],
      runsMap: {},
      count: 0,
      lastUpdated: new Date().toISOString(),
      error: "Unable to fetch latest runs",
    });

    // Cache error responses for a shorter time (1 minute)
    errorResponse.headers.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=30",
    );

    return errorResponse;
  }
}

/**
 * POST /api/dashboard/latest-runs
 *
 * Internal endpoint for updating the cached latest runs.
 * Requires both:
 * 1. Valid short-lived JWT in Authorization: Bearer <token> header
 * 2. Request from allowed internal IP (GCP VPC or configured IPs)
 *
 * Services must first call POST /api/auth/service-token to get a 1-hour JWT,
 * then use that token here. Tokens auto-expire — no manual rotation needed.
 *
 * SECURITY: Tier 2 Implementation
 * - JWT verification: HS256 signed, 1-hour expiry (defense layer 1)
 * - Scope check: token must have "write:latest-runs" scope
 * - IP allowlist check: GCP VPC ranges only (defense layer 2)
 * - Audit logging: service identity + IP + timestamp on every call
 *
 * Body:
 * {
 *   toolName: string,
 *   symbol: string,
 *   result: object
 * }
 *
 * See SECURITY_ENDPOINT_REMEDIATION.md for full security tier documentation
 */
export async function POST(request: Request) {
  const clientIP = getClientIP(request);

  try {
    // DEFENSE LAYER 1: Verify JWT (signed, expiring token)
    const authHeader = request.headers.get("authorization");
    const jwtResult = await verifyBearerToken(authHeader);

    if (!jwtResult.valid) {
      console.warn("Cache update JWT verification failed", {
        reason: jwtResult.reason,
        clientIP,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        {
          error: "Unauthorized",
          details: `JWT check failed: ${jwtResult.reason}`,
        },
        { status: 401 },
      );
    }

    // Verify token has required write scope
    if (!jwtResult.claims.scope.includes("write:latest-runs")) {
      console.warn("Cache update missing required scope", {
        service: jwtResult.claims.sub,
        scope: jwtResult.claims.scope,
        clientIP,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        {
          error: "Forbidden",
          details: "Token missing required scope: write:latest-runs",
        },
        { status: 403 },
      );
    }

    // DEFENSE LAYER 2: Verify Client IP is from allowed range
    if (!isAllowedIP(clientIP)) {
      console.warn("Cache update from disallowed IP", {
        service: jwtResult.claims.sub,
        clientIP,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        { error: "Forbidden", details: "Request IP not in allowed ranges" },
        { status: 403 },
      );
    }

    const { toolName, symbol, result } = await request.json();

    if (!toolName || !result) {
      return NextResponse.json(
        { error: "Missing toolName or result" },
        { status: 400 },
      );
    }

    // Audit log: service identity + IP for traceability
    console.info("Cache update authorized", {
      action: "cache-update",
      service: jwtResult.claims.sub,
      toolName,
      clientIP,
      timestamp: new Date().toISOString(),
    });

    // Upsert the latest run for this tool
    const existingRun = await db
      .select()
      .from(publicLatestRuns)
      .where((t: any) => t.toolName === toolName)
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
        .where((t: any) => t.toolName === toolName)
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
