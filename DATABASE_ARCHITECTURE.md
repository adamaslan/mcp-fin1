# Database Architecture for MCP Finance

## Current Setup

You have **Firestore** already set up and being used by your Python MCP backend in `mcp-finance1`.

### What's in Firestore Now

Based on your existing code:

1. **Stock Analysis Results** (`analysis` collection)
   - Individual stock analyses with AI scores
   - Price data, signals, indicators
   - Updated by Python MCP backend

2. **Daily Summaries** (`summaries` collection)
   - Top bullish/bearish stocks
   - Daily analysis aggregations

3. **Universe Lists** (`universes` collection)
   - SP500, NASDAQ100, ETF lists
   - Symbol lists for scanner

4. **Health Check** (`_health_check` collection)
   - System status

---

## The Problem

Your **Next.js frontend** needs to store:

- ✅ User accounts (from Clerk)
- ✅ Watchlists (user-created lists)
- ✅ Positions (portfolio tracking)
- ✅ Trade journal (trade history)
- ✅ Usage tracking (API limits per tier)
- ✅ Alerts (Max tier feature)

This data is **relational** (users have watchlists, watchlists have symbols, etc.)

---

## Solution: Hybrid Architecture (Recommended)

Use **BOTH** databases for what they're best at:

### Firestore (Read-Only from Next.js)

**Use for**: Stock market data (already populated by Python backend)

- ✅ Stock analysis results
- ✅ Daily summaries
- ✅ Universe lists
- ✅ Cached analysis data

**Why**:

- Already set up and working
- Python backend writes to it
- Perfect for read-heavy stock data
- No need to rewrite Python backend

### PostgreSQL (Read/Write from Next.js)

**Use for**: User/application data (new)

- ✅ Users (Clerk sync)
- ✅ Watchlists
- ✅ Positions
- ✅ Trade journal
- ✅ Usage tracking
- ✅ Alerts

**Why**:

- Better for relational data
- Drizzle ORM provides type safety
- Easier migrations
- Foreign keys and transactions

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Frontend                         │
│                                                               │
│  ┌──────────────────┐              ┌──────────────────┐     │
│  │   User Data      │              │   Stock Data     │     │
│  │  - Watchlists    │              │  - Analysis      │     │
│  │  - Positions     │              │  - Summaries     │     │
│  │  - Trades        │              │  - Universes     │     │
│  │  - Usage Limits  │              │  (Read-Only)     │     │
│  └────────┬─────────┘              └────────┬─────────┘     │
│           │                                  │               │
└───────────┼──────────────────────────────────┼───────────────┘
            │                                  │
            ▼                                  ▼
   ┌─────────────────┐              ┌─────────────────┐
   │   PostgreSQL    │              │   Firestore     │
   │  (Cloud SQL)    │              │  (ttb-lang1)    │
   │                 │              │                 │
   │  users          │              │  analysis       │
   │  watchlists     │              │  summaries      │
   │  positions      │              │  universes      │
   │  trade_journal  │              │                 │
   │  usage_tracking │              │      ▲          │
   │  alerts         │              │      │          │
   └─────────────────┘              └──────┼──────────┘
                                            │
                                            │ (Writes)
                                            │
                                  ┌─────────┴──────────┐
                                  │  Python MCP API    │
                                  │  (Cloud Run)       │
                                  │                    │
                                  │  - Analyze stock   │
                                  │  - Run scans       │
                                  │  - Cache results   │
                                  └────────────────────┘
```

---

## Implementation Plan

### Phase 1: Set Up PostgreSQL (5 minutes)

```bash
# Use the Cloud SQL setup script
./setup-gcp-cloud-sql.sh

# Or use local Docker for dev
./setup-db.sh
```

### Phase 2: Keep Firestore Connection (Already Working)

Your Python backend already writes to Firestore. **No changes needed.**

### Phase 3: Add Firestore Client to Next.js (Optional - Future)

If you want to read stock data directly from Firestore in Next.js:

```bash
npm install firebase firebase-admin
```

```typescript
// src/lib/firebase/client.ts
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp({
    projectId: "ttb-lang1",
  });
}

export const firestore = getFirestore();

// Read stock analysis from Firestore
export async function getStockAnalysis(symbol: string) {
  const doc = await firestore.collection("analysis").doc(symbol).get();
  return doc.data();
}
```

---

## Why Hybrid Is Best

### ✅ Advantages

1. **No Python backend changes** - Firestore already working
2. **Best tool for each job**:
   - Firestore: Fast read-heavy stock data cache
   - PostgreSQL: Relational user data with transactions
3. **Type safety** - Drizzle ORM for PostgreSQL
4. **Easy migrations** - Database schema in code
5. **Cost effective** - Use what you already have

### ❌ Alternatives (Why Not)

**Option 1: Firestore Only**

- ❌ Have to rewrite entire database layer
- ❌ Firestore not ideal for relational data (foreign keys, joins)
- ❌ More complex queries for user data
- ❌ No Drizzle ORM benefits

**Option 2: PostgreSQL Only**

- ❌ Have to rewrite Python backend to use PostgreSQL
- ❌ Have to migrate existing Firestore stock data
- ❌ More work, same result

**Option 3: Hybrid (RECOMMENDED)**

- ✅ Keep what works (Firestore for stocks)
- ✅ Add PostgreSQL for new user features
- ✅ Best of both worlds
- ✅ Minimal changes

---

## Current Data Flow

### Stock Analysis (Firestore)

```
User → Next.js → MCP Cloud Run API → Firestore (cache)
                       ↓
                  Python analysis
                       ↓
                  Return results + Save to Firestore
```

### User Features (PostgreSQL)

```
User → Next.js → PostgreSQL
   ↓
Watchlist CRUD
Position tracking
Usage limits
Trade journal
```

---

## Cost Comparison

### Current Firestore (Already Paying)

- **Reads**: $0.06 per 100k documents
- **Writes**: $0.18 per 100k documents
- **Storage**: $0.18/GB/month
- **Estimated for stock data**: $5-10/month

### Add PostgreSQL Cloud SQL

- **db-f1-micro**: $7-10/month
- **10GB storage**: $1.70/month
- **Total**: ~$10-12/month

### Combined Total

- **~$20-25/month** for both databases
- Each database optimized for its purpose

---

## Quick Decision Matrix

| Need                     | Firestore Only   | PostgreSQL Only | Hybrid (Both)          |
| ------------------------ | ---------------- | --------------- | ---------------------- |
| Rewrite Python backend   | ❌ No            | ✅ Yes          | ❌ No                  |
| Rewrite Next.js DB layer | ✅ Yes (complex) | ❌ No           | ❌ No (simple add)     |
| Type safety with ORM     | ❌ No            | ✅ Yes          | ✅ Yes (for user data) |
| Relational queries       | ⚠️ Complex       | ✅ Easy         | ✅ Easy                |
| Setup time               | 2-3 hours        | 2-3 hours       | 10 minutes             |
| Monthly cost             | ~$10             | ~$15            | ~$25                   |
| **Recommendation**       | ❌               | ❌              | ✅✅✅                 |

---

## Recommended Path Forward

### Step 1: Set Up PostgreSQL

```bash
./setup-gcp-cloud-sql.sh
```

### Step 2: Run Migrations

```bash
npm run db:generate
npm run db:migrate
```

### Step 3: Start Using Both

- **PostgreSQL**: All new user features (watchlists, positions, etc.)
- **Firestore**: Keep for stock analysis cache (no changes)

### Step 4: Test

```bash
npm run dev
```

---

## Questions?

**Q: Can I just use Firestore for everything?**
A: Yes, but you'd need to rewrite the database layer we just created. The hybrid approach is easier.

**Q: Will this increase costs significantly?**
A: ~$10-15/month more, but you get proper relational database for user data.

**Q: Can I migrate later?**
A: Yes! The hybrid approach is a good stepping stone. You can consolidate later if needed.

**Q: What if I want Firestore only?**
A: I can help you rewrite the database layer, but it'll take 2-3 hours instead of 10 minutes.

---

## Next Steps

**To proceed with hybrid architecture (recommended):**

```bash
./setup-gcp-cloud-sql.sh
npm run db:generate
npm run db:migrate
npm run dev
```

**To use Firestore only:**
Let me know and I'll create a Firestore adapter for the user data layer.
