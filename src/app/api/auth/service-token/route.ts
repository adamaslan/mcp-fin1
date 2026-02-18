import { NextResponse } from "next/server";
import { issueServiceToken } from "@/lib/auth/service-tokens";
import { isAllowedIP, getClientIP } from "@/lib/auth/ip-allowlist";

/**
 * POST /api/auth/service-token
 *
 * Internal token generation endpoint — issues short-lived JWTs (1 hour)
 * for service-to-service authentication.
 *
 * SECURITY: IP-gated (GCP VPC only). No external callers can reach this.
 * Services call this once per hour to refresh their token, then use the
 * JWT on protected endpoints like /api/dashboard/latest-runs.
 *
 * Body:
 * {
 *   service: "cache-updater" | "scheduler" | "cron",
 *   scopes: ["write:latest-runs"]
 * }
 *
 * Response:
 * {
 *   token: "<signed-jwt>",
 *   expiresIn: 3600,
 *   expiresAt: "<iso-timestamp>"
 * }
 *
 * See SECURITY_ENDPOINT_REMEDIATION.md for full Tier 2 documentation
 */
export async function POST(request: Request) {
  const clientIP = getClientIP(request);

  // Only allow internal GCP VPC callers to request tokens
  if (!isAllowedIP(clientIP)) {
    console.warn("Service token request from disallowed IP", {
      clientIP,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Require JWT_SECRET to be configured
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET not configured — cannot issue service tokens");
    return NextResponse.json(
      { error: "Service unavailable", details: "Token signing not configured" },
      { status: 503 },
    );
  }

  let body: { service?: string; scopes?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { service, scopes } = body;

  if (!service || !scopes || !Array.isArray(scopes)) {
    return NextResponse.json(
      { error: "Missing required fields: service, scopes" },
      { status: 400 },
    );
  }

  try {
    const token = await issueServiceToken(
      service as "cache-updater" | "scheduler" | "cron",
      scopes as ["write:latest-runs"],
    );

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    console.info("Service token issued", {
      service,
      scopes,
      clientIP,
      expiresAt,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      token,
      expiresIn: 3600,
      expiresAt,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Service token issuance failed", {
      service,
      scopes,
      error: message,
    });

    return NextResponse.json(
      { error: "Failed to issue token", details: message },
      { status: 500 },
    );
  }
}
