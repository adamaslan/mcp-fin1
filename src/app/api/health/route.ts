import { NextResponse } from "next/server";

/**
 * Public health check endpoint
 * Returns the API health status without requiring authentication
 * Useful for monitoring, load balancers, and health checks
 */
export async function GET() {
  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: "1.0.0",
  });
}
