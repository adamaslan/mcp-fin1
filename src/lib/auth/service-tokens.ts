/**
 * Service-to-Service JWT Authentication (Tier 2)
 *
 * Issues and verifies short-lived signed JWTs for internal service calls.
 * Replaces the static x-internal-api-key with cryptographically signed tokens
 * that expire automatically (60 minutes by default).
 *
 * Algorithm: HS256 (HMAC-SHA256, symmetric)
 * See SECURITY_ENDPOINT_REMEDIATION.md for Tier 3 (asymmetric RS256 + GCP)
 */

import { SignJWT, jwtVerify, type JWTPayload } from "jose";

// ─── Constants ────────────────────────────────────────────────────────────────

const TOKEN_EXPIRY_SECONDS = 60 * 60; // 1 hour
const TOKEN_ISSUER = "mcp-finance";

/** Services authorised to call internal endpoints */
const ALLOWED_SERVICE_SUBJECTS = [
  "cache-updater",
  "scheduler",
  "cron",
] as const;
type AllowedService = (typeof ALLOWED_SERVICE_SUBJECTS)[number];

/** Scopes that can be granted to a service token */
const VALID_SCOPES = ["write:latest-runs"] as const;
type ServiceScope = (typeof VALID_SCOPES)[number];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ServiceTokenClaims extends JWTPayload {
  sub: AllowedService;
  scope: ServiceScope[];
  iss: typeof TOKEN_ISSUER;
}

export interface ServiceTokenRequest {
  /** Which service is requesting a token */
  service: AllowedService;
  /** Scopes the token should have */
  scopes: ServiceScope[];
}

export type TokenVerificationResult =
  | {
      valid: true;
      claims: ServiceTokenClaims;
    }
  | {
      valid: false;
      reason: string;
    };

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Encode the JWT_SECRET string into a CryptoKey for jose
 * Throws if JWT_SECRET env var is missing
 */
function getSigningKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET environment variable is required for service token signing",
    );
  }
  if (secret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters long");
  }
  return new TextEncoder().encode(secret);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Issue a signed, short-lived JWT for an internal service
 *
 * @param service - Which service is requesting (e.g. "cache-updater")
 * @param scopes  - Permissions to embed in the token
 * @returns Signed JWT string
 *
 * @example
 * const token = await issueServiceToken("cache-updater", ["write:latest-runs"]);
 * // Use in header: Authorization: Bearer <token>
 */
export async function issueServiceToken(
  service: AllowedService,
  scopes: ServiceScope[],
): Promise<string> {
  if (!ALLOWED_SERVICE_SUBJECTS.includes(service)) {
    throw new Error(`Unknown service: ${service}`);
  }
  for (const s of scopes) {
    if (!VALID_SCOPES.includes(s)) {
      throw new Error(`Unknown scope: ${s}`);
    }
  }

  const key = getSigningKey();
  const now = Math.floor(Date.now() / 1000);

  const token = await new SignJWT({ scope: scopes })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(TOKEN_ISSUER)
    .setSubject(service)
    .setIssuedAt(now)
    .setExpirationTime(now + TOKEN_EXPIRY_SECONDS)
    .sign(key);

  return token;
}

/**
 * Verify a JWT from an internal service request
 *
 * Checks:
 * - Valid signature (HS256 with JWT_SECRET)
 * - Not expired (1 hour TTL)
 * - Issuer is "mcp-finance"
 * - Subject is a known allowed service
 *
 * @param token - Raw JWT string (strip "Bearer " prefix before calling)
 * @returns Verified claims or failure reason
 */
export async function verifyServiceToken(
  token: string | null | undefined,
): Promise<
  { valid: true; claims: ServiceTokenClaims } | { valid: false; reason: string }
> {
  if (!token) {
    return { valid: false, reason: "no-token" };
  }

  let key: Uint8Array;
  try {
    key = getSigningKey();
  } catch {
    return { valid: false, reason: "missing-jwt-secret" };
  }

  try {
    const { payload } = await jwtVerify(token, key, {
      issuer: TOKEN_ISSUER,
      algorithms: ["HS256"],
    });

    // Validate subject is a known service
    if (
      !payload.sub ||
      !ALLOWED_SERVICE_SUBJECTS.includes(payload.sub as AllowedService)
    ) {
      return { valid: false, reason: "unknown-service" };
    }

    // Validate scope claim exists
    if (
      !Array.isArray(payload["scope"]) ||
      (payload["scope"] as string[]).length === 0
    ) {
      return { valid: false, reason: "missing-scope" };
    }

    return {
      valid: true,
      claims: payload as ServiceTokenClaims,
    };
  } catch (err) {
    // jose throws named errors — map them to readable reasons
    if (err instanceof Error) {
      if (err.name === "JWTExpired")
        return { valid: false, reason: "token-expired" };
      if (err.name === "JWSInvalid")
        return { valid: false, reason: "invalid-signature" };
      if (err.name === "JWSSignatureVerificationFailed")
        return { valid: false, reason: "signature-mismatch" };
    }
    return { valid: false, reason: "verification-failed" };
  }
}

/**
 * Extract and verify the Bearer token from an Authorization header
 *
 * @param authHeader - Value of the Authorization header
 */
export async function verifyBearerToken(
  authHeader: string | null,
): Promise<
  { valid: true; claims: ServiceTokenClaims } | { valid: false; reason: string }
> {
  if (!authHeader?.startsWith("Bearer ")) {
    return { valid: false, reason: "missing-bearer-header" };
  }
  const token = authHeader.slice(7); // strip "Bearer "
  return verifyServiceToken(token);
}
