# Database Setup Guide

This guide will help you set up a PostgreSQL database for MCP Finance.

## Option 1: Docker (Recommended - Fastest Setup)

### 1. Install Docker
If you don't have Docker installed:
- **macOS**: Download [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Linux**: `sudo apt install docker.io docker-compose` (Ubuntu/Debian)

### 2. Start PostgreSQL Container
```bash
# Start PostgreSQL in Docker
docker run -d \
  --name mcp-finance-db \
  -e POSTGRES_USER=mcpfinance \
  -e POSTGRES_PASSWORD=devpassword \
  -e POSTGRES_DB=mcp_finance \
  -p 5432:5432 \
  postgres:16-alpine

# Verify it's running
docker ps | grep mcp-finance-db
```

### 3. Add DATABASE_URL to .env.local
```bash
# Add this line to .env.local
echo "DATABASE_URL=postgresql://mcpfinance:devpassword@localhost:5432/mcp_finance" >> .env.local
```

### 4. Generate and Run Migrations
```bash
# Generate migration files from schema
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Optional: Open Drizzle Studio to view database
npm run db:studio
```

### 5. Verify Setup
```bash
# Check database connection
docker exec -it mcp-finance-db psql -U mcpfinance -d mcp_finance -c "\dt"
```

You should see tables like: `users`, `watchlists`, `positions`, `usage_tracking`, etc.

---

## Option 2: Local PostgreSQL Installation

### 1. Install PostgreSQL
**macOS (Homebrew)**:
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ubuntu/Debian**:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database and User
```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create user and database
CREATE USER mcpfinance WITH PASSWORD 'devpassword';
CREATE DATABASE mcp_finance OWNER mcpfinance;
GRANT ALL PRIVILEGES ON DATABASE mcp_finance TO mcpfinance;
\q
```

### 3. Add DATABASE_URL to .env.local
```bash
echo "DATABASE_URL=postgresql://mcpfinance:devpassword@localhost:5432/mcp_finance" >> .env.local
```

### 4. Generate and Run Migrations
```bash
npm run db:generate
npm run db:migrate
npm run db:studio
```

---

## Option 3: Cloud Database (Production-Ready)

### Google Cloud SQL
1. Create Cloud SQL PostgreSQL instance in GCP Console
2. Create database: `mcp_finance`
3. Create user with strong password
4. Add connection string to .env.local:
   ```
   DATABASE_URL=postgresql://user:password@/mcp_finance?host=/cloudsql/project:region:instance
   ```

### Neon (Serverless PostgreSQL - Free tier available)
1. Sign up at [neon.tech](https://neon.tech)
2. Create project: "MCP Finance"
3. Copy connection string from dashboard
4. Add to .env.local:
   ```
   DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/mcp_finance?sslmode=require
   ```

---

## Database Management Commands

```bash
# Generate migration files from schema changes
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Open Drizzle Studio (visual database editor)
npm run db:studio

# Drop all tables (WARNING: deletes all data)
npm run db:drop
```

---

## Troubleshooting

### Error: "DATABASE_URL is required"
**Solution**: Add DATABASE_URL to `.env.local`:
```bash
DATABASE_URL=postgresql://mcpfinance:devpassword@localhost:5432/mcp_finance
```

### Error: "Connection refused" or "Connection timeout"
**Solution**: Check if PostgreSQL is running:
```bash
# Docker
docker ps | grep postgres

# macOS (Homebrew)
brew services list | grep postgresql

# Linux
sudo systemctl status postgresql
```

### Error: "password authentication failed"
**Solution**: Check username/password in DATABASE_URL match your database credentials.

### Error: "database does not exist"
**Solution**: Create the database:
```bash
# Docker
docker exec -it mcp-finance-db psql -U mcpfinance -c "CREATE DATABASE mcp_finance;"

# Local PostgreSQL
sudo -u postgres psql -c "CREATE DATABASE mcp_finance OWNER mcpfinance;"
```

### Want to start fresh?
```bash
# Stop and remove Docker container
docker stop mcp-finance-db && docker rm mcp-finance-db

# Then start fresh from Option 1, Step 2
```

---

## Quick Start Script (Docker)

Create a file `setup-db.sh`:
```bash
#!/bin/bash
set -e

echo "🚀 Setting up PostgreSQL database..."

# Start PostgreSQL container
docker run -d \
  --name mcp-finance-db \
  -e POSTGRES_USER=mcpfinance \
  -e POSTGRES_PASSWORD=devpassword \
  -e POSTGRES_DB=mcp_finance \
  -p 5432:5432 \
  postgres:16-alpine

echo "⏳ Waiting for PostgreSQL to start..."
sleep 5

# Add DATABASE_URL to .env.local
if ! grep -q "DATABASE_URL" .env.local 2>/dev/null; then
  echo "DATABASE_URL=postgresql://mcpfinance:devpassword@localhost:5432/mcp_finance" >> .env.local
  echo "✓ Added DATABASE_URL to .env.local"
fi

# Generate and run migrations
echo "📝 Generating migrations..."
npm run db:generate

echo "🔄 Running migrations..."
npm run db:migrate

echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "  1. Start dev server: npm run dev"
echo "  2. View database: npm run db:studio"
echo ""
echo "To stop database: docker stop mcp-finance-db"
echo "To start database: docker start mcp-finance-db"
```

Make it executable and run:
```bash
chmod +x setup-db.sh
./setup-db.sh
```

---

## Next Steps

After database is set up:
1. Start development server: `npm run dev`
2. Create your first user by signing in via Clerk
3. User will be automatically added to database
4. View data in Drizzle Studio: `npm run db:studio`

---

## Database Schema

The application uses these tables:

- **users** - User accounts synced with Clerk
- **watchlists** - User watchlists with stock symbols
- **positions** - Portfolio positions tracking
- **trade_journal** - Trade history and P&L
- **usage_tracking** - API usage limits per tier
- **alerts** - Price and signal alerts (Max tier)

All tables are defined in `src/lib/db/schema.ts`.
