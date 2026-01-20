# NeonDB Setup Guide - Free Tier

## Why Neon?

✅ **Free tier includes:**
- 0.5 GB storage (plenty for this app)
- Unlimited queries
- Auto-suspend after inactivity (saves compute)
- 100 hours compute/month (resets monthly)
- No credit card required
- Built-in connection pooling
- Instant database branches

✅ **Perfect for:**
- Development
- Testing
- Small production apps
- Side projects

---

## Quick Setup (2 minutes)

### Step 1: Create Neon Account

1. Go to: https://console.neon.tech/signup
2. Sign up with GitHub, Google, or Email (free, no credit card)
3. Click **"Create a project"**

### Step 2: Configure Project

**Project settings:**
- **Project name**: `mcp-finance`
- **Database name**: `mcp_finance` (default is fine)
- **Region**: Choose closest to you:
  - `us-east-2` (Ohio) - USA East
  - `us-west-2` (Oregon) - USA West
  - `eu-central-1` (Frankfurt) - Europe
- **Compute**: Keep default (0.25 vCPU shared)
- Click **"Create Project"**

### Step 3: Get Connection String

After creation, you'll see:

```
Connection String

postgresql://[user]:[password]@[endpoint].neon.tech/[database]?sslmode=require
```

**Copy the full connection string** - you'll need it!

**Example:**
```
postgresql://neondb_owner:npg_abc123xyz@ep-cool-moon-12345.us-east-2.aws.neon.tech/mcp_finance?sslmode=require
```

---

## Step 4: Add to Your Project

### Option A: Automated (Recommended)

Run this script:
```bash
./setup-neon-db.sh
```

It will:
- Prompt you to paste your connection string
- Add it to `.env.local`
- Run migrations
- Test the connection

### Option B: Manual

1. **Add to .env.local:**
```bash
# Paste your connection string from Neon
DATABASE_URL=postgresql://neondb_owner:npg_abc123xyz@ep-cool-moon-12345.us-east-2.aws.neon.tech/mcp_finance?sslmode=require
```

2. **Generate and run migrations:**
```bash
npm run db:generate
npm run db:migrate
```

3. **Test connection:**
```bash
npm run dev
# Look for: "✓ Connected to PostgreSQL database"
```

---

## Free Tier Limits

| Resource | Free Tier | Your Usage | Status |
|----------|-----------|------------|--------|
| Storage | 0.5 GB | ~10-50 MB | ✅ Plenty |
| Compute | 100 hrs/month | ~20-40 hrs | ✅ Enough |
| Projects | 1 | 1 | ✅ Perfect |
| Databases | Unlimited | 1 | ✅ Good |
| Queries | Unlimited | N/A | ✅ Great |
| Connections | 100 pooled | ~5-10 | ✅ Fine |

**Estimate:** Your app will use ~15-30% of free tier limits.

### Auto-Suspend
Neon automatically suspends compute after 5 minutes of inactivity:
- ✅ Saves your 100 hours/month
- ✅ Cold start: ~500ms (barely noticeable)
- ✅ Perfect for development

---

## Viewing Your Database

### Option 1: Neon Console (Web UI)
1. Go to: https://console.neon.tech
2. Select your project
3. Click **"Tables"** tab
4. Browse data in web interface

### Option 2: Drizzle Studio (Local)
```bash
npm run db:studio
```
Opens at: http://localhost:4983

### Option 3: psql CLI
```bash
# Using connection string from Neon
psql "postgresql://[your-connection-string]"

# List tables
\dt

# Query users
SELECT * FROM users;
```

---

## Connection Pooling

Neon includes built-in **connection pooling** - no setup needed!

**Your connection string format:**
```
# Pooled connection (recommended for serverless)
postgresql://user:pass@endpoint.neon.tech/db?sslmode=require

# Direct connection (for migrations)
postgresql://user:pass@endpoint-pooler.neon.tech/db?sslmode=require
```

For Next.js, use the **pooled** connection (without `-pooler`).

---

## Monitoring Usage

### Check Compute Hours
1. Go to: https://console.neon.tech
2. Click your project
3. **Settings** → **Usage**
4. See compute hours used

**Tip:** Your app will likely use 20-40 hours/month in development.

### Check Storage
In Neon Console:
- **Settings** → **Storage**
- Should show ~10-50 MB for this app

---

## Production Considerations

### When to Upgrade from Free Tier

Upgrade when you hit:
- ✅ **80+ compute hours/month** ($19/month for 300 hours)
- ✅ **400+ MB storage** (unlikely for this app)
- ✅ **Need more projects** (Pro: $19/month unlimited)
- ✅ **Need higher uptime SLA** (Pro: 99.95%)

### Free Tier is Enough If:
- ✅ Development only
- ✅ Small side project (<1000 users)
- ✅ Low traffic (<10k requests/day)
- ✅ You're okay with auto-suspend

---

## Troubleshooting

### Error: "Connection timeout"
**Solution:** Check your connection string:
```bash
# Test connection
psql "YOUR_CONNECTION_STRING"

# Should connect successfully
```

### Error: "SSL required"
**Solution:** Make sure `?sslmode=require` is at the end:
```
postgresql://...@....neon.tech/db?sslmode=require
```

### Error: "Database does not exist"
**Solution:** Database is created automatically. Check project name in Neon console.

### Slow First Query
**Normal!** Neon auto-suspends after inactivity.
- First query after suspend: ~500ms
- Subsequent queries: ~10-50ms

---

## Backup Strategy

### Neon Automatic Backups
- ✅ **Free tier**: 1-day point-in-time recovery
- ✅ **Pro tier**: 7-day point-in-time recovery

### Manual Backup
```bash
# Export database
pg_dump "YOUR_CONNECTION_STRING" > backup.sql

# Restore
psql "YOUR_CONNECTION_STRING" < backup.sql
```

---

## Cost Comparison

| Provider | Free Tier | Paid | When to Use |
|----------|-----------|------|-------------|
| **Neon** | ✅ 0.5GB, 100hrs | $19/mo | Dev, small prod |
| GCP Cloud SQL | ❌ None | $10/mo | Always-on prod |
| Local Docker | ✅ Free | Free | Local dev only |
| Supabase | ✅ 500MB, 2 proj | $25/mo | Need auth + DB |

**Verdict:** Neon is perfect for your use case!

---

## Security Best Practices

1. **Never commit connection string** - It's already in `.gitignore`
2. **Rotate password regularly** - In Neon Console → Settings → Security
3. **Use environment variables** - Already set up in `.env.local`
4. **Monitor access logs** - In Neon Console → Logs

---

## Database Branches (Pro Feature)

Neon has a cool feature called **database branches**:
- Create instant copies of your database
- Perfect for testing migrations
- Free tier: 1 branch, Pro: unlimited

```bash
# Create branch (Pro only, but useful to know)
neonctl branches create --name testing --parent main
```

---

## Next Steps After Setup

1. ✅ Create Neon account (1 minute)
2. ✅ Copy connection string
3. ✅ Run: `./setup-neon-db.sh`
4. ✅ Test: `npm run dev`
5. ✅ View data: `npm run db:studio`

---

## Useful Links

- **Neon Console**: https://console.neon.tech
- **Neon Docs**: https://neon.tech/docs
- **Pricing**: https://neon.tech/pricing
- **Status**: https://status.neon.tech
- **Discord**: https://discord.gg/neon

---

## Summary

✅ **Free forever** (0.5GB storage, 100 hours compute/month)
✅ **No credit card** required
✅ **Auto-suspend** saves compute hours
✅ **Perfect for development** and small production apps
✅ **Serverless** - scales to zero when not in use
✅ **Fast setup** - 2 minutes total

**Your app will use ~20-40 hours/month and ~10-50 MB storage = well within free tier!**
