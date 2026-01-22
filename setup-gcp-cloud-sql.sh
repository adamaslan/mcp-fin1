#!/bin/bash
set -e

PROJECT_ID="ttb-lang1"
INSTANCE_NAME="mcp-finance-db"
REGION="us-central1"
DB_NAME="mcp_finance"
DB_USER="mcpfinance"

echo "🚀 Setting up GCP Cloud SQL for MCP Finance..."
echo ""
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Set project
gcloud config set project $PROJECT_ID

# Enable Cloud SQL Admin API
echo "📡 Enabling Cloud SQL Admin API..."
gcloud services enable sqladmin.googleapis.com --project=$PROJECT_ID
echo "⏳ Waiting for API to be fully enabled (30 seconds)..."
sleep 30

# Check if instance already exists
if gcloud sql instances describe $INSTANCE_NAME --project=$PROJECT_ID &>/dev/null; then
    echo "✓ Cloud SQL instance '$INSTANCE_NAME' already exists"
else
    echo "📦 Creating Cloud SQL PostgreSQL instance..."
    echo "   (This takes 5-10 minutes...)"

    gcloud sql instances create $INSTANCE_NAME \
      --database-version=POSTGRES_15 \
      --tier=db-f1-micro \
      --region=$REGION \
      --storage-size=10GB \
      --storage-type=SSD \
      --storage-auto-increase \
      --network=default \
      --project=$PROJECT_ID

    echo "⏳ Waiting for instance to be fully ready..."
    sleep 30
fi

# Get instance details
CONNECTION_NAME=$(gcloud sql instances describe $INSTANCE_NAME --format="value(connectionName)" --project=$PROJECT_ID)
PUBLIC_IP=$(gcloud sql instances describe $INSTANCE_NAME --format="value(ipAddresses[0].ipAddress)" --project=$PROJECT_ID)

# Create database
echo "📝 Creating database '$DB_NAME'..."
gcloud sql databases create $DB_NAME \
  --instance=$INSTANCE_NAME \
  --project=$PROJECT_ID 2>/dev/null || echo "✓ Database already exists"

# Generate strong password
DB_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-24)

# Create user
echo "👤 Creating database user '$DB_USER'..."
gcloud sql users create $DB_USER \
  --instance=$INSTANCE_NAME \
  --password="$DB_PASSWORD" \
  --project=$PROJECT_ID 2>/dev/null || echo "✓ User already exists (using existing password)"

# Get your current IP for whitelisting
echo "🔒 Whitelisting your IP address..."
MY_IP=$(curl -s ifconfig.me)
gcloud sql instances patch $INSTANCE_NAME \
  --authorized-networks=$MY_IP/32 \
  --project=$PROJECT_ID --quiet 2>/dev/null || echo "✓ IP already whitelisted"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Cloud SQL PostgreSQL instance is ready!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Connection Information:"
echo "  Instance Name:   $INSTANCE_NAME"
echo "  Connection Name: $CONNECTION_NAME"
echo "  Public IP:       $PUBLIC_IP"
echo "  Database:        $DB_NAME"
echo "  User:            $DB_USER"
echo "  Password:        $DB_PASSWORD"
echo "  Your IP:         $MY_IP (whitelisted)"
echo ""
echo "🔐 Database URL (add to .env.local):"
echo ""
echo "DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@$PUBLIC_IP:5432/$DB_NAME"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Add to .env.local
if ! grep -q "DATABASE_URL=" .env.local 2>/dev/null; then
    echo "DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@$PUBLIC_IP:5432/$DB_NAME" >> .env.local
    echo "✅ DATABASE_URL added to .env.local"
else
    echo "⚠️  DATABASE_URL already exists in .env.local"
    echo "   Replace it with the URL above if you want to use this new database"
fi

echo ""
echo "🎯 Next steps:"
echo "  1. Generate migrations: npm run db:generate"
echo "  2. Run migrations:      npm run db:migrate"
echo "  3. Start dev server:    npm run dev"
echo ""
echo "💡 Tips:"
echo "  - View database: npm run db:studio"
echo "  - GCP Console: https://console.cloud.google.com/sql/instances/$INSTANCE_NAME?project=$PROJECT_ID"
echo "  - Cost: ~\$10-12/month (db-f1-micro)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
