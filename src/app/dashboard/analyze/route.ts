import { NextResponse } from "next/server";

/**
 * Redirect /dashboard/analyze to /api/mcp/analyze
 * This handles the 404 error by routing to the correct endpoint
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const redirectUrl = new URL("/api/mcp/analyze", url.origin);

  // Forward the request body
  const body = await request.text();

  return fetch(redirectUrl.toString(), {
    method: "POST",
    headers: request.headers,
    body,
  });
}
