# Security Remediation: `/api/dashboard/latest-runs` Endpoint

## Issue Summary

The `POST /api/dashboard/latest-runs` endpoint uses a static `x-internal-api-key` header for authorization, which is vulnerable to key leakage and provides no audit trail for internal service calls.

**Current Implementation**:

```typescript
const authHeader = request.headers.get("x-internal-api-key");
const internalKey = process.env.INTERNAL_API_KEY;

if (internalKey && authHeader !== internalKey) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

## Risk Assessment

### Severity: **MEDIUM** (Non-sensitive data, internal endpoint)

**Why**:

- Endpoint updates cached landing page data (public, non-critical)
- Intended for internal service-to-service communication
- No user account data or sensitive financial information exposed

**But still problematic because**:

- Static key can be leaked via environment variable exposure, logs, or CI/CD
- No way to rotate key without redeploying entire service
- No audit trail of who updated the cache
- Single point of failure for all internal callers

---

## Solution Tiers

### TIER 1: Quick Fix (Implement NOW) ✅ Low Effort / Medium Security

**Approach**: Combine header key check + IP allowlisting

**Pros**:

- Minimal code changes
- Fast to implement
- Works in GCP environment
- Defense-in-depth strategy

**Cons**:

- Still relies on static key (but now secondary)
- Requires IP configuration management

**Implementation**:

1. Keep the header key check
2. Add IP allowlist of internal Cloud Run/Scheduler IPs
3. Both must pass for authorization

```typescript
const ALLOWED_INTERNAL_IPS = [
  "10.0.0.0/8", // GCP internal VPC range
  process.env.CLOUD_RUN_SERVICE_IP, // Optional: Specific Cloud Run service
];

function isAllowedIP(ip: string): boolean {
  // Check if request IP is in allowed ranges
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("x-internal-api-key");
  const clientIP =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown";

  const hasValidKey = authHeader === process.env.INTERNAL_API_KEY;
  const hasAllowedIP = isAllowedIP(clientIP);

  if (!hasValidKey || !hasAllowedIP) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rest of endpoint logic...
}
```

---

### TIER 2: JWT Service-to-Service Auth ✅ Implemented (Phase 6)

**Approach**: JWT-based service-to-service authentication

**Pros**:

- Tokens have expiration times (auto-rotate)
- Cryptographically signed (can't be faked)
- No static secrets stored server-side
- Built-in audit trail (token claims)
- Industry standard for service auth
- Works with multiple signers (service rotation)

**Cons**:

- Requires token generation service
- Slightly more complex implementation
- Need to manage signing keys

**How it works**:

1. Internal service requests a short-lived JWT token from a token endpoint
2. Token includes: service identity, scopes, expiration (15-60 min)
3. Service includes token in Authorization header
4. Endpoint verifies signature and expiration
5. Log claims for audit trail

**Implementation Outline**:

```typescript
// src/lib/auth/service-tokens.ts
import jwt from "jsonwebtoken";

interface ServiceClaims {
  iss: "mcp-finance"; // issuer
  sub: string; // subject (service name)
  scope: string[]; // permissions
  exp: number; // expiration
  iat: number; // issued at
}

export function verifyServiceToken(token: string): ServiceClaims | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_PUBLIC_KEY!);

    // Verify required claims
    if (decoded.iss !== "mcp-finance") return null;
    if (!["cache-updater", "scheduler"].includes(decoded.sub)) return null;
    if (!decoded.scope.includes("write:latest-runs")) return null;

    return decoded as ServiceClaims;
  } catch {
    return null;
  }
}

// POST endpoint
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  const claims = verifyServiceToken(token || "");
  if (!claims) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Log for audit trail
  console.log(`Cache updated by service: ${claims.sub}`, {
    timestamp: new Date().toISOString(),
    service: claims.sub,
    scope: claims.scope,
  });

  // Rest of endpoint logic...
}
```

**Comparison to current approach**:
| Feature | Current | Tier 2 |
|---------|---------|--------|
| Static key | ✓ | ✗ |
| Auto-expiration | ✗ | ✓ (15-60 min) |
| Audit trail | ✗ | ✓ |
| Signature verification | ✗ | ✓ |
| Key rotation | Manual redeploy | Automatic |

---

### TIER 3: Enterprise Solution (Phase 7+) 🏆 Advanced / Best Security

**Approach**: GCP Service Accounts + Workload Identity + Cloud IAM

**Pros**:

- No secrets stored in .env (uses GCP managed keys)
- Automatic token rotation every hour
- Audit logging via Google Cloud Logging
- Works with GCP VPC and Cloud Run natively
- Zero-trust network compatible
- Production-grade security

**Cons**:

- GCP-specific (can't use in other cloud providers)
- Requires GCP infrastructure setup
- More complex configuration

**How it works**:

1. Create GCP service account for cache-updater job
2. Grant service account permission to call the API
3. Service uses `getIDToken()` or `getAccessToken()`
4. Endpoint verifies token with Google's cert endpoint
5. All audit logged in Cloud Audit Logs

**Implementation Outline**:

```typescript
// Verify GCP ID Token
import { IdTokenClient } from "google-auth-library";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  const client = new IdTokenClient({
    idTokenProvider: new IdTokenProvider(), // Google Auth
  });

  try {
    const payload = await client.verifyIdToken({
      idToken: token!,
      audience: "https://yourdomain.com/api/dashboard/latest-runs",
    });

    const serviceAccount = payload.sub; // e.g., "cache-updater@project.iam.gserviceaccount.com"

    // Token is verified, proceed
    // Cloud Audit Logs will record this automatically
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
```

---

## Implementation Roadmap

| Phase           | Tier   | Status      | Timeline    | Benefits                          |
| --------------- | ------ | ----------- | ----------- | --------------------------------- |
| **5**           | Tier 1 | ✅ Complete | Done        | Defense-in-depth, IP allowlist    |
| **6 (Current)** | Tier 2 | ✅ Complete | Done        | JWT auto-expiry, service identity |
| **7**           | Tier 3 | 📋 Backlog  | Post-launch | Enterprise-grade, GCP-native      |

---

## Tier 1 Implementation Checklist

- [ ] Update `.env.example` with `INTERNAL_API_KEY` documentation
- [ ] Add IP allowlist helper function
- [ ] Implement combined header + IP check in POST handler
- [ ] Add logging for audit trail (service, IP, timestamp)
- [ ] Test with known IP addresses
- [ ] Document in API comments
- [ ] Update CLAUDE.md with security guidelines if needed

---

## Security Best Practices

### For This Endpoint

1. **Always validate both**:
   - API key (verifies authorized service)
   - IP address (verifies trusted network)

2. **Log all requests**:

   ```typescript
   logger.info("Cache update request", {
     service: "cache-updater",
     ip: clientIP,
     toolName,
     timestamp: new Date().toISOString(),
   });
   ```

3. **Monitor for abuse**:
   - Alert if 10+ failed auth attempts from same IP
   - Alert if invalid key used more than 3 times
   - Track update frequency per tool

4. **Rotate keys periodically**:
   - Update `INTERNAL_API_KEY` every 90 days
   - Redeploy service with new key
   - Communicate to all internal services

### General API Security

- Never log full request/response bodies (may contain sensitive data)
- Use short-lived tokens whenever possible
- Implement rate limiting on all endpoints
- Monitor and alert on unusual patterns
- Use mTLS for service-to-service when available

---

## References

- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [GCP Service Accounts](https://cloud.google.com/iam/docs/service-accounts)
- [Next.js Security Guidelines](https://nextjs.org/docs/app/building-your-application/configuring/custom-server)
- [OWASP API Security](https://owasp.org/www-project-api-security/)

---

## Questions?

For concerns about implementation or security, reach out to the security team or review the code with a peer before deployment.
