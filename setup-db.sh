#!/bin/bash
set -e

echo "🚀 Setting up PostgreSQL database for MCP Finance..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed."
    echo ""
    echo "Please install Docker:"
    echo "  macOS: https://www.docker.com/products/docker-desktop"
    echo "  Linux: sudo apt install docker.io"
    echo ""
    echo "Or follow the manual setup in DB_SETUP.md"
    exit 1
fi

# Check if container already exists
if docker ps -a | grep -q mcp-finance-db; then
    echo "📦 PostgreSQL container already exists"

    # Check if it's running
    if docker ps | grep -q mcp-finance-db; then
        echo "✓ Database is already running"
    else
        echo "🔄 Starting existing container..."
        docker start mcp-finance-db
        sleep 3
    fi
else
    echo "📦 Creating PostgreSQL container..."
    docker run -d \
      --name mcp-finance-db \
      -e POSTGRES_USER=mcpfinance \
      -e POSTGRES_PASSWORD=devpassword \
      -e POSTGRES_DB=mcp_finance \
      -p 5432:5432 \
      postgres:16-alpine

    echo "⏳ Waiting for PostgreSQL to start..."
    sleep 5
fi

# Add DATABASE_URL to .env.local if not present
if ! grep -q "DATABASE_URL" .env.local 2>/dev/null; then
    echo "DATABASE_URL=postgresql://mcpfinance:devpassword@localhost:5432/mcp_finance" >> .env.local
    echo "✓ Added DATABASE_URL to .env.local"
else
    echo "✓ DATABASE_URL already in .env.local"
fi

# Generate migrations
echo ""
echo "📝 Generating migrations..."
npm run db:generate

# Run migrations
echo ""
echo "🔄 Running migrations..."
npm run db:migrate

# Verify connection
echo ""
echo "🔍 Verifying database setup..."
docker exec mcp-finance-db psql -U mcpfinance -d mcp_finance -c "\dt" | grep -E "users|watchlists|positions|usage_tracking" && echo "✅ Tables created successfully!"

echo ""
echo "✅ Database setup complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Database Information:"
echo "  Host:     localhost:5432"
echo "  Database: mcp_finance"
echo "  User:     mcpfinance"
echo "  Password: devpassword"
echo ""
echo "🎯 Next steps:"
echo "  1. Start dev server:  npm run dev"
echo "  2. View database:     npm run db:studio"
echo "  3. Sign in to create your first user"
echo ""
echo "🛠️  Database commands:"
echo "  Stop database:   docker stop mcp-finance-db"
echo "  Start database:  docker start mcp-finance-db"
echo "  View logs:       docker logs mcp-finance-db"
echo "  Remove database: docker stop mcp-finance-db && docker rm mcp-finance-db"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
