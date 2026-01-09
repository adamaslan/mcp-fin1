# Deployment Guide - Next.js MCP Finance Dashboard

## Overview

This guide covers deploying the Next.js MCP Finance dashboard to Vercel with integration to:
- Clerk authentication
- GCP Cloud SQL PostgreSQL database
- Cloud Run MCP API endpoint

---

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Clerk application created and configured
- [ ] GCP Cloud SQL database created (if using database)
- [ ] Cloud Run MCP API deployed and accessible
- [ ] Local testing completed with all three tier experiences
- [ ] Database migrations run (if applicable)
- [ ] All dependencies installed: `npm install`
- [ ] No build errors: `npm run build`

---

## Step 1: Vercel Project Setup

### 1.1 Create Vercel Project

```bash
# Login to Vercel
npx vercel login

# Deploy project
npx vercel

# Follow prompts:
# - Framework: Next.js
# - Source: nextjs-mcp-finance
# - Build command: npm run build
# - Output directory: .next
# - Install dependencies: Yes
```

Or create project via Vercel dashboard:
1. Go to https://vercel.com/new
2. Select "Next.js" template
3. Import from GitHub repository
4. Configure project settings (accept defaults for Next.js)

### 1.2 Configure Git Deployment

```bash
# Push to GitHub (if not already)
git add .
git commit -m "Initial deployment"
git push origin main

# Link to Vercel
npx vercel link

# Set production branch
# (Usually 'main' is the default)
```

---

## Step 2: Environment Variables

### 2.1 Add to Vercel Project

Go to **Vercel Dashboard → Project Settings → Environment Variables**

Add the following variables for each environment (Development, Preview, Production):

#### Clerk Authentication

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: pk_live_XXXXX
CLERK_SECRET_KEY: sk_live_XXXXX
NEXT_PUBLIC_CLERK_SIGN_IN_URL: /sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL: /sign-up
CLERK_WEBHOOK_SECRET: whsec_XXXXX
```

Get values from Clerk Dashboard:
1. Go to https://dashboard.clerk.com
2. Select application
3. Go to API Keys → Copy keys
4. Go to Webhooks → Create webhook (select events)

#### MCP Cloud Run

```
MCP_CLOUD_RUN_URL: https://technical-analysis-api-XXXXX.run.app
```

Get from GCP Cloud Run deployment:
1. Go to https://console.cloud.google.com/run
2. Select service
3. Copy service URL

#### Database (Optional - Only if using Cloud SQL)

```
DATABASE_URL: postgresql://user:password@/dbname?host=/cloudsql/project:region:instance
```

For Cloud SQL Unix socket (recommended for Vercel):
- Format: `postgresql://user:password@/dbname?host=/cloudsql/project:region:instance`
- Replace:
  - `user`: database user
  - `password`: database password
  - `dbname`: database name
  - `project:region:instance`: Cloud SQL instance connection name

**Note:** Using Cloud SQL Proxy is recommended for Vercel deployments.

#### Optional Admin Configuration

```
ADMIN_EMAILS: admin1@example.com,admin2@example.com
```

### 2.2 Environment Variable Tips

- Use different keys for Preview vs Production
- For development, use Clerk's test keys
- For production, use Clerk's live keys
- Store sensitive values only in Vercel secrets (not in git)

### 2.3 Verify Environment Setup

```bash
# Test environment variables are accessible
npx vercel env pull

# Check .env.local has all variables
cat .env.local
```

---

## Step 3: Database Setup (If Using Cloud SQL)

### 3.1 Create Cloud SQL Instance

```bash
# Using gcloud CLI
gcloud sql instances create mcp-finance-db \
  --database-version POSTGRES_15 \
  --tier db-f1-micro \
  --region us-central1 \
  --availability-type REGIONAL

# Enable Compute Engine API if needed
gcloud services enable compute.googleapis.com
```

### 3.2 Create Database and User

```bash
# Connect to instance
gcloud sql connect mcp-finance-db --user=postgres

# In psql prompt:
CREATE DATABASE mcp_finance;
CREATE USER app_user WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE mcp_finance TO app_user;
\q
```

### 3.3 Run Migrations

```bash
# Locally first to verify
npm run db:migrate

# Or on Vercel (as post-build hook)
# Add to package.json:
# "postbuild": "npx drizzle-kit migrate"
```

### 3.4 Setup Cloud SQL Proxy for Vercel

Option A: Using Cloud SQL Auth Proxy (Recommended)

```bash
# Install in project
npm install --save-dev cloud-sql-proxy

# Update package.json scripts:
# "build": "next build && npx cloud-sql-proxy --unix-socket=/cloudsql PROJECT:REGION:INSTANCE &"
```

Option B: Using IAM Authentication

```bash
# Verify service account has Cloud SQL Client role
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member=serviceAccount:vercel-sa@PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/cloudsql.client
```

---

## Step 4: Clerk Webhook Configuration

### 4.1 Create Webhook in Clerk

1. Go to Clerk Dashboard → Webhooks
2. Create new webhook with URL:
   ```
   https://yourdomain.vercel.app/api/webhooks/clerk
   ```
3. Select events: `user.created`, `user.updated`, `user.deleted`
4. Copy signing secret to `CLERK_WEBHOOK_SECRET` in Vercel

### 4.2 Test Webhook

```bash
# After deployment, check webhook logs in Clerk dashboard
# Should see successful events when:
# - User signs up
# - User metadata updated (tier change)
# - User deleted
```

---

## Step 5: Cloud Run MCP Integration

### 5.1 Deploy MCP Server (If Not Already Deployed)

```bash
# From mcp-finance1 directory
cd ../mcp-finance1

# Build and deploy to Cloud Run
gcloud run deploy technical-analysis-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY
```

### 5.2 Enable CORS (If Needed)

Add CORS headers in Cloud Run response if calling from browser:
- Update Cloud Run service to add Access-Control headers
- Or use Cloud Armour policy

### 5.3 Test MCP Endpoint

```bash
# From deployed Vercel app, test MCP connection
curl -X POST https://technical-analysis-api-XXXXX.run.app/analyze \
  -H "Content-Type: application/json" \
  -d '{"symbol":"AAPL","period":"1mo","useAi":true}'
```

---

## Step 6: Deployment

### 6.1 Manual Deployment

```bash
# Deploy to production
npx vercel deploy --prod

# Or push to main branch (if using git deployment)
git push origin main
```

### 6.2 Automated Deployment

Once project is linked:
1. Push to main branch
2. Vercel automatically builds and deploys
3. Check deployment status at https://vercel.com/dashboard

### 6.3 Verify Deployment

```bash
# Check deployment logs
npx vercel logs

# Check environment variables applied
curl https://yourdomain.vercel.app/api/health

# Test Clerk integration
# Visit https://yourdomain.vercel.app/sign-in
# Should redirect to Clerk login
```

---

## Step 7: Post-Deployment Setup

### 7.1 Configure Clerk Redirect URLs

Go to Clerk Dashboard → Applications → Settings → URLs

Update:
- **Sign in URL**: `https://yourdomain.vercel.app/sign-in`
- **Sign up URL**: `https://yourdomain.vercel.app/sign-up`
- **Callback URL**: `https://yourdomain.vercel.app/auth/callback`
- **Allowed redirect URLs**: `https://yourdomain.vercel.app/**`

### 7.2 Update Domain in Code

If using custom domain:
1. Add domain to Vercel project
2. DNS configuration (follow Vercel's guide)
3. Update Clerk callback URLs to new domain

### 7.3 Create First Admin User

1. Sign up as user in application
2. Get user ID from Clerk Dashboard
3. Manually set tier to 'max' in Clerk:
   ```
   publicMetadata: {
     "tier": "max"
   }
   ```
4. This user can then manage other user tiers

### 7.4 Set Up Monitoring

**Vercel Analytics:**
- Automatically enabled for Vercel Pro plans
- View at https://vercel.com/dashboard/analytics

**Clerk Events:**
- Go to Clerk Dashboard → Webhooks → Events
- Monitor authentication events

**Cloud SQL Monitoring:**
- Go to GCP Console → Cloud SQL → Instances
- Monitor CPU, memory, connections

---

## Step 8: Custom Domain (Optional)

### 8.1 Add Domain to Vercel

1. Go to Vercel Project Settings → Domains
2. Enter your domain (e.g., `finance.example.com`)
3. Follow DNS configuration instructions
4. Verify domain after DNS updates (can take 10-30 minutes)

### 8.2 Update Clerk Redirect URLs

Update Clerk settings with new domain URLs:
```
https://finance.example.com/sign-in
https://finance.example.com/sign-up
```

---

## Troubleshooting

### Database Connection Issues

**Error:** `Error: connect ECONNREFUSED`

Solution:
1. Verify `DATABASE_URL` format is correct
2. Check Cloud SQL instance is running: `gcloud sql instances list`
3. Verify Cloud SQL Proxy is running
4. Check firewall rules allow connection

### MCP API Not Reachable

**Error:** `Failed to fetch from Cloud Run`

Solution:
1. Verify Cloud Run service is deployed: `gcloud run list`
2. Check service is public (allow-unauthenticated)
3. Test endpoint with curl from Vercel logs
4. Verify `MCP_CLOUD_RUN_URL` is correct

### Clerk Authentication Not Working

**Error:** User gets stuck on sign-in page

Solution:
1. Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is for production
2. Check Clerk redirect URLs match Vercel domain
3. Clear browser cache and cookies
4. Check Clerk logs for errors

### Build Failures

**Error:** `Build failed`

Solution:
1. Check build logs: `npx vercel logs`
2. Run `npm run build` locally to reproduce
3. Verify all TypeScript types are correct
4. Check Node.js version compatibility (18+ required)

---

## Monitoring & Maintenance

### Daily Checks

- [ ] Vercel deployment status (green)
- [ ] Clerk webhook events processing
- [ ] Cloud SQL instance healthy
- [ ] Cloud Run service responding

### Weekly Checks

- [ ] Review Vercel analytics
- [ ] Check error logs
- [ ] Monitor database growth
- [ ] Verify backups (Cloud SQL)

### Monthly Tasks

- [ ] Update dependencies: `npm update`
- [ ] Review Clerk user activity
- [ ] Analyze performance metrics
- [ ] Plan database maintenance if needed

---

## Rollback Procedure

### Quick Rollback (Within 7 Days)

```bash
# View previous deployments
npx vercel deployments list

# Rollback to previous deployment
npx vercel rollback <DEPLOYMENT_URL>
```

### Git Rollback

```bash
# If code caused issues
git revert <COMMIT_HASH>
git push origin main
# Vercel auto-deploys the revert
```

---

## Cost Optimization

- **Vercel**: ~$20-50/month for Hobby plan (includes auto-scaling)
- **Cloud SQL**: ~$50-100/month for db-f1-micro instance
- **Cloud Run**: ~$0-20/month (pay per use)
- **Clerk**: Free tier up to 10,000 MAU, then $0.02-0.03 per MAU

Total estimated: **$100-200/month**

---

## Production Checklist

```
Pre-Launch:
- [ ] All environment variables set in Vercel
- [ ] Database migrations applied
- [ ] Clerk webhooks configured
- [ ] Cloud Run endpoint tested
- [ ] Error monitoring set up (optional: Sentry, etc.)
- [ ] Email notifications configured (optional)
- [ ] Backup strategy planned (Cloud SQL automated backups)

Launch:
- [ ] Domain configured (if custom)
- [ ] SSL certificate installed (automatic via Vercel)
- [ ] DNS records updated
- [ ] Monitoring dashboards set up
- [ ] Team notifications sent

Post-Launch:
- [ ] Monitor error rates and logs
- [ ] Track user signups and tier adoption
- [ ] Plan feature rollouts
- [ ] Schedule regular backups
- [ ] Document runbook for support team
```

---

## Getting Help

- **Vercel Docs**: https://vercel.com/docs
- **Clerk Docs**: https://clerk.com/docs
- **GCP Cloud SQL**: https://cloud.google.com/sql/docs
- **Cloud Run**: https://cloud.google.com/run/docs
- **Next.js**: https://nextjs.org/docs

---

## Next Steps

After successful deployment:

1. **Monitor First Week**
   - Watch error logs closely
   - Respond to any user issues
   - Verify all tier features work in production

2. **Iterate on Feedback**
   - Collect user feedback
   - Fix bugs quickly
   - Plan feature enhancements

3. **Plan Phase 2 Features**
   - Multi-universe scanning
   - Real-time alerts with email/SMS
   - Advanced portfolio optimization
   - API access for power users
