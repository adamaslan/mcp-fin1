/**
 * API route for reading cached MCP tool results from Firestore.
 *
 * No authentication required — cached data is read-only and already aggregated.
 *
 * Query params:
 *   - tool (required): Tool name (e.g., "analyze_security")
 *   - key (optional): Cache key (e.g., symbol or joined key). If omitted, returns latest.
 *   - latest (optional): If "true", ignores key and returns most recent cached result
 */

import { NextResponse } from "next/server";
import {
  readMCPToolResult,
  readLatestMCPToolResult,
} from "@/lib/firebase/landing-cache";

export async function GET(req: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const tool = searchParams.get("tool");
    const key = searchParams.get("key");
    const latest = searchParams.get("latest");

    if (!tool) {
      return NextResponse.json(
        { success: false, error: "Missing required 'tool' parameter" },
        { status: 400 },
      );
    }

    let data = null;

    if (latest === "true" || !key) {
      // Return most recently cached result for this tool
      data = await readLatestMCPToolResult(tool);
    } else if (key) {
      // Return specific cached result by key
      data = await readMCPToolResult(tool, key);
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: `No cached data for tool: ${tool}` },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Failed to fetch cached tool result:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch cached tool data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Revalidate every 5 minutes — aligned with backend Firestore cache TTL
export const revalidate = 300;
