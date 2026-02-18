# Security Quick Reference

## `/api/dashboard/latest-runs` Endpoint Security

### Current Implementation: Tier 1

**Location**: `src/app/api/dashboard/latest-runs/route.ts`
**Security Utility**: `src/lib/auth/ip-allowlist.ts`
**Documentation**: `SECURITY_ENDPOINT_REMEDIATION.md`

### How It Works

The `POST` endpoint requires **two checks** to pass:

```
┌─────────────────────────────────────────┐
│ Request to /api/dashboard/latest-runs   │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
     ┌──▼──────────────┐  ┌──▼──────────────┐
     │  Layer 1: Key   │  │ Layer 2: IP     │
     │  Check valid    │  │ Check allowed   │
     │  API key in     │  │ internal IP     │
     │  header         │  │                 │
     └──┬──────────────┘  └──┬──────────────┘
        │                     │
        └──────────┬──────────┘
                   │
            ┌──────▼──────┐
            │ Both pass?  │
            └──────┬──────┘
            ┌──────┴──────┐
           YES           NO
            │              │
        ┌───▼────┐    ┌────▼────┐
        │ 200 OK │    │ 401 Unauth
        │ Update │    │ Log warn
        │ cache  │    │
        └────────┘    └─────────┘
```

### Layer 1: API Key Validation

**Header Required**: `x-internal-api-key`

```bash
curl -X POST https://your-domain/api/dashboard/latest-runs \
  -H "x-internal-api-key: your_secret_key_here"
```

**Environment Variable**: `INTERNAL_API_KEY` (in `.env.local` or deployment env)

### Layer 2: IP Validation

**Allowed IP Ranges** (automatic, no config needed):

- `10.0.0.0/8` - GCP VPC internal
- `172.16.0.0/12` - Alternative GCP VPC
- `127.0.0.1` - Localhost (development)
- `::1` - IPv6 localhost

**Custom IPs** (if needed):

```bash
# In .env or deployment environment
ALLOWED_INTERNAL_IPS=203.0.113.1,203.0.113.2
```

### Testing Locally

```bash
# Valid key + allowed IP ✅
curl -X POST http://localhost:3000/api/dashboard/latest-runs \
  -H "x-internal-api-key: test-key-123" \
  -H "x-forwarded-for: 10.0.0.1" \
  -H "Content-Type: application/json" \
  -d '{"toolName":"analyze_security","symbol":"AAPL","result":{}}'
# Response: 200 OK

# Invalid key ❌
curl -X POST http://localhost:3000/api/dashboard/latest-runs \
  -H "x-internal-api-key: wrong-key" \
  -H "x-forwarded-for: 10.0.0.1" \
  -H "Content-Type: application/json" \
  -d '{"toolName":"analyze_security","symbol":"AAPL","result":{}}'
# Response: 401 Unauthorized (reason: "invalid-api-key")

# Invalid IP ❌
curl -X POST http://localhost:3000/api/dashboard/latest-runs \
  -H "x-internal-api-key: test-key-123" \
  -H "x-forwarded-for: 203.0.113.99" \
  -H "Content-Type: application/json" \
  -d '{"toolName":"analyze_security","symbol":"AAPL","result":{}}'
# Response: 401 Unauthorized (reason: "disallowed-ip")
```

---

## Common Scenarios

### ✅ Cloud Scheduler (Works Great)

Cloud Scheduler calls are automatically allowed because they come from GCP VPC.

```bash
# GCP Cloud Scheduler configuration
gcloud scheduler jobs create http cache-updater \
  --schedule="0 * * * *" \
  --http-method=POST \
  --uri="https://your-domain.com/api/dashboard/latest-runs" \
  --headers="x-internal-api-key=YOUR_API_KEY_HERE" \
  --message-body='{"toolName":"analyze_security","symbol":"AAPL","result":{}}'
```

**Result**: ✅ Passes Layer 1 (has key) + Layer 2 (GCP VPC IP) = 200 OK

### ✅ Cloud Run Service (Works Great)

Services in the same GCP project have internal GCP VPC addresses.

```bash
# From within Cloud Run service
const response = await fetch(
  'https://your-domain.com/api/dashboard/latest-runs',
  {
    method: 'POST',
    headers: {
      'x-internal-api-key': process.env.INTERNAL_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      toolName: 'analyze_security',
      symbol: 'AAPL',
      result: {},
    }),
  }
);
```

**Result**: ✅ Passes both layers = 200 OK

### ✅ Local Development (Works Great)

Local requests come from `127.0.0.1` (localhost), which is in the allowed list.

```bash
# In development
INTERNAL_API_KEY=test-key-for-dev npm run dev

# Then test locally
curl -X POST http://localhost:3000/api/dashboard/latest-runs \
  -H "x-internal-api-key: test-key-for-dev" \
  -H "Content-Type: application/json" \
  -d '...'
```

**Result**: ✅ Passes both layers = 200 OK

### ❌ External Service (Fails - by Design)

A service outside GCP (e.g., your laptop, GitHub Actions) won't have a GCP VPC IP.

```bash
# From external IP 203.0.113.1
curl -X POST https://your-domain.com/api/dashboard/latest-runs \
  -H "x-internal-api-key: your-key" \
  -d '...'
```

**Result**: ❌ Fails Layer 2 (external IP) = 401 Unauthorized

**Solution**: Add to `ALLOWED_INTERNAL_IPS` environment variable if this is a trusted service.

---

## Monitoring & Debugging

### Check Authorization Failures

**Cloud Run Logs**:

```bash
gcloud logging read "resource.type=cloud_run_revision AND \
  jsonPayload.message='Cache update unauthorized'" --limit 10
```

**Look for these in logs**:

```json
{
  "message": "Cache update unauthorized",
  "reason": "invalid-api-key" OR "disallowed-ip",
  "clientIP": "10.0.0.1",
  "hasValidKey": false,
  "hasAllowedIP": true,
  "timestamp": "2026-02-17T10:00:00Z"
}
```

### Check Successful Updates

```bash
gcloud logging read "resource.type=cloud_run_revision AND \
  jsonPayload.message='Cache update request authorized'" --limit 10
```

**Look for**:

```json
{
  "message": "Cache update request authorized",
  "action": "cache-update",
  "toolName": "analyze_security",
  "clientIP": "10.0.0.1",
  "timestamp": "2026-02-17T10:00:00Z"
}
```

---

## Troubleshooting

### "401 Unauthorized - Failed: invalid-api-key"

**Cause**: API key doesn't match

**Fix**:

1. Verify `INTERNAL_API_KEY` is set in environment
2. Check key value matches in request header
3. Ensure no typos or extra spaces

```bash
# Verify env var is set
echo $INTERNAL_API_KEY

# Update if needed
export INTERNAL_API_KEY="new-key-here"
```

### "401 Unauthorized - Failed: disallowed-ip"

**Cause**: Request IP is not in allowed ranges

**Fix**:

1. If this is a trusted service, add its IP to `ALLOWED_INTERNAL_IPS`
2. If in GCP, ensure service has GCP VPC IP (check Cloud Run networking)
3. Check x-forwarded-for header is correct (if behind proxy)

```bash
# For external service, add to environment
ALLOWED_INTERNAL_IPS=203.0.113.1,203.0.113.2
```

### Key Rotation / Regeneration

To change the API key:

1. **Generate new key**:

   ```bash
   openssl rand -hex 32
   ```

2. **Update environment**:
   - Development: Update `.env.local`
   - Production: Update deployment env vars
   - CI/CD: Update GitHub Secrets

3. **Update all callers**: Services calling the endpoint need the new key

4. **Verify**: Test endpoint with new key

---

## Future Improvements (Roadmap)

### Phase 6: Tier 2 (JWT-based)

- **Why**: Auto-expiring tokens, better audit trail
- **Timeline**: 2-3 weeks post-launch
- **Benefit**: Tokens expire automatically (15-60 min), harder to leak

### Phase 7: Tier 3 (GCP Service Accounts)

- **Why**: Zero-trust, automatic rotation, built-in audit logs
- **Timeline**: Post-Phase 6
- **Benefit**: Enterprise-grade, no static secrets

See `SECURITY_ENDPOINT_REMEDIATION.md` for full roadmap and implementation details.

---

## Reference Files

| File                                         | Purpose                              |
| -------------------------------------------- | ------------------------------------ |
| `SECURITY_ENDPOINT_REMEDIATION.md`           | Full security guide with all 3 tiers |
| `TIER_1_IMPLEMENTATION_SUMMARY.md`           | Implementation details and checklist |
| `src/lib/auth/ip-allowlist.ts`               | IP validation utility code           |
| `src/app/api/dashboard/latest-runs/route.ts` | Endpoint with security checks        |
| `.env.example`                               | Environment variable documentation   |

---

**Last Updated**: 2026-02-17
**Tier**: 1 (Current Implementation)
**Status**: ✅ Production Ready
