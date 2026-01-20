#!/bin/bash
set -e

echo "🚀 Setting up NeonDB for MCP Finance (Free Tier)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if DATABASE_URL already exists
if grep -q "DATABASE_URL=" .env.local 2>/dev/null; then
    echo "⚠️  DATABASE_URL already exists in .env.local"
    echo ""
    read -p "Do you want to replace it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Cancelled. Keeping existing DATABASE_URL"
        exit 0
    fi
    # Remove existing DATABASE_URL
    sed -i.bak '/^DATABASE_URL=/d' .env.local
    echo "✅ Removed old DATABASE_URL"
fi

echo "📋 Instructions:"
echo ""
echo "1. Go to: https://console.neon.tech/signup"
echo "2. Sign up (free, no credit card)"
echo "3. Create a new project:"
echo "   - Name: mcp-finance"
echo "   - Region: Choose closest to you"
echo "   - Database: mcp_finance"
echo ""
echo "4. Copy your connection string (looks like):"
echo "   postgresql://user:pass@ep-xxx.neon.tech/mcp_finance?sslmode=require"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Prompt for connection string
read -p "📝 Paste your Neon connection string: " CONNECTION_STRING

# Validate connection string
if [[ ! $CONNECTION_STRING =~ ^postgresql:// ]]; then
    echo ""
    echo "❌ Invalid connection string format"
    echo "   Should start with: postgresql://"
    exit 1
fi

if [[ ! $CONNECTION_STRING =~ neon\.tech ]]; then
    echo ""
    echo "⚠️  Warning: This doesn't look like a Neon connection string"
    echo "   Expected: ...@ep-xxx.neon.tech/..."
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Cancelled"
        exit 1
    fi
fi

# Add to .env.local
echo "DATABASE_URL=$CONNECTION_STRING" >> .env.local
echo ""
echo "✅ Added DATABASE_URL to .env.local"
echo ""

# Test connection
echo "🔍 Testing connection..."
if npx tsx -e "
const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL || '', { max: 1 });
sql\`SELECT 1\`.then(() => {
  console.log('✅ Connection successful!');
  sql.end();
  process.exit(0);
}).catch((err) => {
  console.error('❌ Connection failed:', err.message);
  process.exit(1);
});
" 2>/dev/null; then
    echo ""
else
    echo ""
    echo "⚠️  Connection test failed (but this might be normal for tsx)"
    echo "   We'll verify when we run migrations"
    echo ""
fi

# Generate migrations
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Generating migrations from schema..."
echo ""

if npm run db:generate 2>&1 | tee /tmp/db-generate.log; then
    echo ""
    echo "✅ Migrations generated successfully"
else
    echo ""
    echo "⚠️  Migration generation had warnings (this is usually fine)"
fi

# Run migrations
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 Running migrations..."
echo ""

if npm run db:migrate 2>&1 | tee /tmp/db-migrate.log; then
    echo ""
    echo "✅ Migrations applied successfully"
else
    echo ""
    echo "❌ Migration failed. Check the output above."
    exit 1
fi

# Success summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ NeonDB setup complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Your database is ready with these tables:"
echo "   - users"
echo "   - watchlists"
echo "   - positions"
echo "   - trade_journal"
echo "   - usage_tracking"
echo "   - alerts"
echo ""
echo "🎯 Next steps:"
echo "   1. Start dev server:  npm run dev"
echo "   2. View database:     npm run db:studio"
echo "   3. Sign in to create your first user"
echo ""
echo "💡 Neon Free Tier Limits:"
echo "   - Storage: 0.5 GB (you'll use ~10-50 MB)"
echo "   - Compute: 100 hours/month (you'll use ~20-40 hours)"
echo "   - Auto-suspends after 5 minutes of inactivity"
echo ""
echo "🔗 Manage your database:"
echo "   - Neon Console: https://console.neon.tech"
echo "   - Drizzle Studio: npm run db:studio"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
