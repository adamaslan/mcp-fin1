# Security Best Practices - MCP Finance

This document outlines security best practices for the MCP Finance dashboard.

## 🔐 Environment Variables & Secrets

### Critical: DO NOT Commit Secrets

The following files are **NEVER** to be committed to git:

- `.env.local`
- `.env.*.local`
- Any file containing API keys, passwords, or credentials
- `credentials.json`, `*.key`, `*.pem` files

**What to do instead:**

1. **Local Development:**

   ```bash
   cp .env.example .env.local
   # Fill in your local values
   npm run dev
   ```

2. **Vercel Deployment:**
   - Add variables via Vercel Dashboard → Project Settings → Environment Variables
   - Do NOT commit `.env.local` or actual values to git

3. **Git Hook Protection:**
   ```bash
   # Optional: install git hook to prevent accidental commits
   npm install --save-dev husky
   npx husky install
   ```

### Environment Variables Checklist

**Before committing code:**

- [ ] `.env.local` is in `.gitignore`
- [ ] No hardcoded API keys in code
- [ ] No database passwords in code
- [ ] No Clerk secret keys in code
- [ ] No private key files (`*.pem`, `*.key`) in repo

**Before deploying to production:**

- [ ] Vercel environment variables set to PRODUCTION keys
- [ ] Different keys for dev/staging/production
- [ ] Secrets rotated (at least quarterly)
- [ ] Database password is strong (16+ chars, mixed case, numbers, symbols)

---

## 🛡️ Authentication & Tier Security

### Server-Side Validation (Critical)

All tier-based features are validated on the server:

```typescript
// Example: API route validates tier server-side
export async function POST(request: Request) {
  const { userId } = await auth();
  const { sessionClaims } = await auth();
  const tier = (sessionClaims?.publicMetadata as any)?.tier || "free";

  // Server-side check - client cannot bypass
  if (tier !== "max") {
    return Response.json(
      { error: "Feature available for Max tier only" },
      { status: 403 },
    );
  }

  // Process request...
}
```

**Why this matters:**

- Client-side checks can be bypassed
- Always validate on server
- Never trust client-provided tier data

### Clerk Integration

**Security:**

- Session tokens validated automatically via Clerk middleware
- Tier metadata stored securely in Clerk
- Webhook validation prevents spoofing

**Configuration:**

1. Set `CLERK_WEBHOOK_SECRET` in environment
2. Verify webhook signature on all incoming events
3. Only update user metadata via Clerk, not from client

---

## 🗄️ Database Security

### Connection Security

**For Cloud SQL:**

- Use Cloud SQL Proxy for secure local connections
- Use Unix sockets when possible (more secure than TCP)
- Enable Cloud SQL Auth Proxy for Vercel

**Connection string format:**

```
postgresql://user:password@/dbname?host=/cloudsql/project:region:instance
```

### Data Protection

- [ ] Never log sensitive data (API keys, passwords, PII)
- [ ] Use parameterized queries (Drizzle ORM handles this)
- [ ] Enable Cloud SQL encryption at rest
- [ ] Enable SSL/TLS for database connections
- [ ] Regular backups enabled (Cloud SQL automatic backups)

### Query Security

**SAFE - Using Drizzle ORM:**

```typescript
const user = await db.query.users.findFirst({
  where: eq(users.clerk_id, userId), // Parameterized
});
```

**UNSAFE - Never do this:**

```typescript
// DON'T: SQL injection vulnerability
const user = await db.raw(`SELECT * FROM users WHERE id = '${userId}'`);
```

---

## 🔗 API Security

### Rate Limiting

Implement rate limiting on sensitive endpoints:

```typescript
// Example: Implement rate limiting per user
const rateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(
  userId: string,
  maxRequests = 100,
  windowSeconds = 3600,
) {
  const now = Date.now();
  const record = rateLimit.get(userId);

  if (!record || record.resetAt < now) {
    rateLimit.set(userId, { count: 1, resetAt: now + windowSeconds * 1000 });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}
```

### CORS Configuration

**For Cloud Run MCP API:**

```
Access-Control-Allow-Origin: https://yourdomain.com (specific domain, not *)
Access-Control-Allow-Methods: POST, GET
Access-Control-Allow-Headers: Content-Type, Authorization
```

**Never use:**

```
Access-Control-Allow-Origin: * (wildcard)
```

### API Response Filtering

**Always filter sensitive data:**

```typescript
// Safe: Only return safe fields
return Response.json({
  symbol: trade.symbol,
  pnl: trade.pnl,
  // Don't return: password, email, api_key
});
```

---

## 🔒 HTTPS & Transport Security

### Vercel Deployment

- [x] HTTPS enabled automatically
- [x] HTTP redirects to HTTPS
- [x] Certificates renewed automatically
- [x] HSTS headers sent

### Check Configuration

```bash
# Verify HTTPS
curl -I https://yourdomain.vercel.app

# Check headers
curl -I https://yourdomain.vercel.app | grep -i "strict-transport-security"
```

---

## 🖥️ Client-Side Security

### XSS Prevention (Cross-Site Scripting)

**Safe in Next.js/React:**

```tsx
// Safe - React escapes by default
<div>{userInput}</div>;

// Safe - Using sanitization library
import DOMPurify from "dompurify";
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />;
```

**Unsafe - Never do this:**

```tsx
// DON'T - Direct HTML injection
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### CSRF Protection

- [x] Clerk handles CSRF tokens
- [x] POST requests validated via origin
- [x] SameSite cookies configured

---

## 📊 Monitoring & Logging

### What to Log

✅ **Safe to log:**

- User actions (login, trade logged, alert created)
- API request counts
- Error messages (non-sensitive)
- Performance metrics

❌ **Never log:**

- Passwords or API keys
- Database connection strings
- Personal identifiable information (PII)
- Credit card numbers
- Clerk secret keys

### Logging Example

```typescript
import logger from "@/lib/logger";

// Good
logger.info("Trade logged", { userId, symbol, shares });

// Bad
logger.info("User login", { userId, password }); // DON'T
```

### Error Reporting (Sentry Optional)

```typescript
import * as Sentry from "@sentry/nextjs";

// Initialize in layout or API route
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  // Never send API keys in error context
});

// Capture error without sensitive data
Sentry.captureException(error, {
  tags: { userId, feature: "portfolio" },
  // Don't include: apiKey, password, database_url
});
```

---

## 🔄 Dependency Security

### Keep Dependencies Updated

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update

# Check specific package
npm outdated
```

### .gitignore Protection

The robust `.gitignore` file includes:

- ✅ All `.env*` files
- ✅ All `.key`, `.pem` files
- ✅ Credentials and secrets
- ✅ IDE workspace files
- ✅ Node modules
- ✅ Build artifacts

**Verification:**

```bash
# Check what git tracks
git ls-files | grep -E "\.(env|key|pem|credentials)" # Should be empty

# Check what's ignored
git check-ignore -v .env.local # Should show it's ignored
```

---

## 🧪 Security Testing

### Before Deployment

- [ ] Run `npm audit` - no vulnerabilities
- [ ] Check sensitive files not in git: `git ls-files | grep -E "\.(env|key|pem)"`
- [ ] Verify HTTPS on domain
- [ ] Test authentication flow
- [ ] Verify tier gates work
- [ ] Test CORS configuration
- [ ] Check rate limiting

### Regular Security Audits

- [ ] Monthly: Run `npm audit` and update critical packages
- [ ] Quarterly: Rotate API keys and secrets
- [ ] Quarterly: Review access logs
- [ ] Annually: Security assessment

---

## 📋 Security Checklist

### Development

- [ ] `.env.local` in `.gitignore` (not committed)
- [ ] `.env.example` created (committed, shows structure)
- [ ] No hardcoded secrets in code
- [ ] Server-side tier validation on all protected routes
- [ ] No sensitive data logged
- [ ] HTTPS enforced in production

### Deployment (Vercel)

- [ ] Environment variables set in Vercel (not in code)
- [ ] Using production Clerk keys
- [ ] Database password is strong
- [ ] Cloud SQL proxy configured
- [ ] CORS headers set correctly
- [ ] Rate limiting implemented
- [ ] Error handling doesn't expose internals

### Infrastructure (GCP)

- [ ] Cloud SQL encryption at rest enabled
- [ ] Cloud SQL automated backups enabled
- [ ] Cloud Run service authenticated (if private)
- [ ] Service accounts have minimal permissions
- [ ] Firewall rules restrict access

### Ongoing

- [ ] Security monitoring enabled (Sentry, etc.)
- [ ] Regular dependency updates
- [ ] Secret rotation schedule established
- [ ] Access logs reviewed regularly
- [ ] Backups tested monthly

---

## 📞 Security Incident Response

### If You Suspect a Breach

1. **Immediately:**
   - Revoke compromised API keys
   - Rotate database passwords
   - Update Clerk secret keys

2. **Within 1 hour:**
   - Check server logs for suspicious activity
   - Review recent deployments
   - Check git history for accidental commits

3. **Within 24 hours:**
   - Update security team
   - Perform code audit
   - Run security tests

### Example: Accidental Secret Commit

```bash
# If you accidentally commit a secret:

# 1. Remove from git history
git filter-branch --tree-filter 'rm -f .env.local' HEAD

# 2. Force push (if not already pushed to shared repo)
git push origin --force

# 3. Revoke the secret immediately
# (Update API key in Clerk, rotate database password, etc.)

# 4. Add to .gitignore and commit
git add .gitignore
git commit -m "Add .env.local to gitignore"
```

---

## 🔗 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/advanced-features/security-headers)
- [Clerk Security Docs](https://clerk.com/docs/security)
- [GCP Cloud SQL Security](https://cloud.google.com/sql/docs/postgres/security)
- [NPM Audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)

---

## Questions?

Contact security team or refer to the deployment guide for environment setup instructions.

**Last Updated:** January 2025
