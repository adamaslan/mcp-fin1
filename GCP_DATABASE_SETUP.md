# GCP Cloud SQL Setup Guide

## Step 1: Create Cloud SQL PostgreSQL Instance

### Via GCP Console

1. **Go to Cloud SQL**: https://console.cloud.google.com/sql
2. **Click "Create Instance"**
3. **Choose "PostgreSQL"**
4. **Configure Instance:**
   - **Instance ID**: `mcp-finance-db` (or your preferred name)
   - **Password**: Set a strong password for `postgres` user
   - **Database version**: PostgreSQL 15 or 16
   - **Region**: Choose closest to you (e.g., `us-central1`)
   - **Zonal availability**: Single zone (for dev) or Multiple zones (for prod)
   - **Machine type**:
     - Dev: `db-f1-micro` (shared core, 0.6 GB RAM) - cheapest
     - Prod: `db-n1-standard-1` (1 vCPU, 3.75 GB RAM)
   - **Storage**: 10 GB SSD (auto-increase enabled)
   - **Connections**:
     - ✅ Public IP (for development)
     - ✅ Private IP (optional, for production VPC)

5. **Click "Create Instance"** (takes 5-10 minutes)

### Via gcloud CLI (Faster)

```bash
# Set your project
gcloud config set project YOUR_PROJECT_ID

# Create Cloud SQL instance
gcloud sql instances create mcp-finance-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --storage-size=10GB \
  --storage-type=SSD \
  --network=default

# Set postgres user password
gcloud sql users set-password postgres \
  --instance=mcp-finance-db \
  --password=YOUR_STRONG_PASSWORD
```

---

## Step 2: Create Database and User

### Option A: Via Cloud Console

1. Go to your instance: Cloud SQL → `mcp-finance-db`
2. Click **"Databases"** tab → **"Create Database"**
   - Name: `mcp_finance`
   - Click "Create"
3. Click **"Users"** tab → **"Add User Account"**
   - Username: `mcpfinance`
   - Password: (generate strong password)
   - Click "Add"

### Option B: Via gcloud + psql

```bash
# Create database
gcloud sql databases create mcp_finance --instance=mcp-finance-db

# Create user
gcloud sql users create mcpfinance \
  --instance=mcp-finance-db \
  --password=YOUR_USER_PASSWORD

# Connect via Cloud SQL Proxy (optional, for testing)
gcloud sql connect mcp-finance-db --user=postgres
# Then run: CREATE DATABASE mcp_finance;
```

---

## Step 3: Get Connection Information

### Find Your Instance Details

```bash
# Get instance connection name
gcloud sql instances describe mcp-finance-db --format="value(connectionName)"
# Output: PROJECT_ID:REGION:INSTANCE_NAME

# Get public IP address
gcloud sql instances describe mcp-finance-db --format="value(ipAddresses[0].ipAddress)"
# Output: 34.XXX.XXX.XXX
```

Or via Console:

1. Cloud SQL → `mcp-finance-db` → **"Overview"**
2. Note:
   - **Connection name**: `project-id:region:instance-name`
   - **Public IP address**: `34.XXX.XXX.XXX`

---

## Step 4: Configure Connection

### Method A: Direct Public IP Connection (Development)

**⚠️ You need to whitelist your IP address first:**

```bash
# Get your current IP
curl ifconfig.me

# Whitelist your IP (replace with your IP)
gcloud sql instances patch mcp-finance-db \
  --authorized-networks=YOUR_IP_ADDRESS/32
```

**Then add to .env.local:**

```bash
DATABASE_URL=postgresql://mcpfinance:YOUR_PASSWORD@PUBLIC_IP:5432/mcp_finance
```

### Method B: Cloud SQL Proxy (Recommended for Development)

**Install Cloud SQL Proxy:**

```bash
# macOS
brew install cloud-sql-proxy

# Linux
wget https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64 -O cloud-sql-proxy
chmod +x cloud-sql-proxy
sudo mv cloud-sql-proxy /usr/local/bin/
```

**Start the proxy:**

```bash
# Run in a separate terminal (keep it running)
cloud-sql-proxy PROJECT_ID:REGION:INSTANCE_NAME \
  --port=5432

# Example:
# cloud-sql-proxy my-project:us-central1:mcp-finance-db --port=5432
```

**Add to .env.local:**

```bash
DATABASE_URL=postgresql://mcpfinance:YOUR_PASSWORD@localhost:5432/mcp_finance
```

### Method C: Unix Socket (Production - Vercel/Cloud Run)

**For Cloud Run/Vercel deployment:**

```bash
DATABASE_URL=postgresql://mcpfinance:YOUR_PASSWORD@/mcp_finance?host=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME
```

---

## Step 5: Run Migrations

```bash
# Generate migration files from schema
npm run db:generate

# Apply migrations to Cloud SQL
npm run db:migrate

# Verify tables were created
npm run db:studio
```

---

## Step 6: Test Connection

```bash
# Start dev server
npm run dev

# The app should connect successfully
# Check console for: "✓ Connected to PostgreSQL database"
```

**Test with a simple query:**

```bash
# Connect via Cloud SQL Proxy or direct connection
psql "postgresql://mcpfinance:YOUR_PASSWORD@localhost:5432/mcp_finance"

# List tables
\dt

# Should see: users, watchlists, positions, usage_tracking, etc.
```

---

## Quick Setup Script

Create `setup-gcp-db.sh`:

```bash
#!/bin/bash
set -e

PROJECT_ID="your-project-id"
REGION="us-central1"
INSTANCE_NAME="mcp-finance-db"
DB_PASSWORD="YOUR_STRONG_PASSWORD"

echo "🚀 Setting up GCP Cloud SQL database..."

# Create instance (if doesn't exist)
if ! gcloud sql instances describe $INSTANCE_NAME &>/dev/null; then
    echo "📦 Creating Cloud SQL instance..."
    gcloud sql instances create $INSTANCE_NAME \
      --database-version=POSTGRES_15 \
      --tier=db-f1-micro \
      --region=$REGION \
      --storage-size=10GB \
      --project=$PROJECT_ID

    echo "⏳ Waiting for instance to be ready..."
    sleep 60
fi

# Create database
echo "📝 Creating database..."
gcloud sql databases create mcp_finance --instance=$INSTANCE_NAME --project=$PROJECT_ID 2>/dev/null || echo "Database already exists"

# Create user
echo "👤 Creating user..."
gcloud sql users create mcpfinance \
  --instance=$INSTANCE_NAME \
  --password=$DB_PASSWORD \
  --project=$PROJECT_ID 2>/dev/null || echo "User already exists"

# Get connection info
CONNECTION_NAME=$(gcloud sql instances describe $INSTANCE_NAME --format="value(connectionName)" --project=$PROJECT_ID)
PUBLIC_IP=$(gcloud sql instances describe $INSTANCE_NAME --format="value(ipAddresses[0].ipAddress)" --project=$PROJECT_ID)

echo ""
echo "✅ Cloud SQL instance ready!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Connection Information:"
echo "  Connection Name: $CONNECTION_NAME"
echo "  Public IP:       $PUBLIC_IP"
echo "  Database:        mcp_finance"
echo "  User:            mcpfinance"
echo ""
echo "🔐 Add to .env.local (choose one):"
echo ""
echo "# Option 1: Via Cloud SQL Proxy (recommended for dev)"
echo "DATABASE_URL=postgresql://mcpfinance:$DB_PASSWORD@localhost:5432/mcp_finance"
echo ""
echo "# Option 2: Direct connection (whitelist your IP first)"
echo "DATABASE_URL=postgresql://mcpfinance:$DB_PASSWORD@$PUBLIC_IP:5432/mcp_finance"
echo ""
echo "# Option 3: Unix socket (for Cloud Run/Vercel)"
echo "DATABASE_URL=postgresql://mcpfinance:$DB_PASSWORD@/mcp_finance?host=/cloudsql/$CONNECTION_NAME"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 Next steps:"
echo "  1. Add DATABASE_URL to .env.local"
echo "  2. Run: npm run db:generate"
echo "  3. Run: npm run db:migrate"
echo "  4. Run: npm run dev"
```

---

## Troubleshooting

### Error: "Connection refused"

**Solution**: Use Cloud SQL Proxy or whitelist your IP:

```bash
# Whitelist your IP
curl ifconfig.me  # Get your IP
gcloud sql instances patch mcp-finance-db \
  --authorized-networks=YOUR_IP/32
```

### Error: "password authentication failed"

**Solution**: Reset the user password:

```bash
gcloud sql users set-password mcpfinance \
  --instance=mcp-finance-db \
  --password=NEW_PASSWORD
```

### Error: "database does not exist"

**Solution**: Create the database:

```bash
gcloud sql databases create mcp_finance --instance=mcp-finance-db
```

### Error: "too many connections"

**Solution**: Increase max connections or reduce connection pool:

```bash
# In your database client (src/lib/db/client.ts)
# Reduce max connections:
const client = postgres(process.env.DATABASE_URL, {
  max: 5,  // Reduce from 10 to 5
});
```

### Connection is slow

**Solution**: Make sure you're in the same region:

- Check instance region: `gcloud sql instances describe mcp-finance-db --format="value(region)"`
- Choose a region close to you

---

## Cost Optimization

### Development

- **Instance**: `db-f1-micro` (shared core) ~$7-10/month
- **Storage**: 10 GB SSD ~$1.70/month
- **Total**: ~$10-12/month

### Production

- **Instance**: `db-n1-standard-1` (1 vCPU) ~$45-50/month
- **Storage**: 10 GB SSD ~$1.70/month
- **Backups**: ~$0.08/GB/month
- **Total**: ~$50-60/month

### Tips to Reduce Costs

1. Use `db-f1-micro` for development
2. Enable automatic storage increase (prevent over-provisioning)
3. Set up automatic backups retention (7 days is usually enough)
4. Use Cloud SQL Proxy to avoid public IP charges
5. Stop instance when not in use (dev only):
   ```bash
   gcloud sql instances patch mcp-finance-db --activation-policy=NEVER
   # To restart: --activation-policy=ALWAYS
   ```

---

## Security Best Practices

1. **Use strong passwords** (20+ characters, mix of letters/numbers/symbols)
2. **Whitelist specific IPs** instead of 0.0.0.0/0
3. **Enable SSL connections** in production
4. **Use Cloud SQL Proxy** for local development
5. **Use Unix sockets** for Cloud Run/Vercel deployments
6. **Enable automated backups** (default: daily at 3am)
7. **Set up point-in-time recovery** for production
8. **Rotate passwords regularly**

---

## Next Steps

After database is set up:

1. ✅ Add DATABASE_URL to .env.local
2. ✅ Run migrations: `npm run db:generate && npm run db:migrate`
3. ✅ Start dev server: `npm run dev`
4. ✅ Sign in to create first user
5. ✅ View data: `npm run db:studio`
