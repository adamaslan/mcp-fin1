# Frontend-Backend Connection Guide

This guide explains how the Next.js frontend connects to the MCP Cloud Run backend for the MCP Finance application.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Environment Setup](#environment-setup)
3. [MCPClient Deep Dive](#mcpclient-deep-dive)
4. [API Route Pattern](#api-route-pattern)
5. [Adding New Endpoints](#adding-new-endpoints)
6. [Request/Response Examples](#requestresponse-examples)
7. [Tier-Based Filtering](#tier-based-filtering)
8. [Testing & Debugging](#testing--debugging)
9. [Production Deployment](#production-deployment)
10. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER BROWSER                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS APPLICATION                               │
│  ┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐  │
│  │   React         │     │  API Routes      │     │   Middleware    │  │
│  │   Components    │────▶│  /api/mcp/*      │────▶│   (Clerk Auth)  │  │
│  │                 │     │                  │     │                 │  │
│  └─────────────────┘     └──────────────────┘     └─────────────────┘  │
│                                   │                                      │
│                                   ▼                                      │
│                          ┌──────────────────┐                           │
│                          │   MCPClient      │                           │
│                          │   (lib/mcp/)     │                           │
│                          └──────────────────┘                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP POST (JSON)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      GOOGLE CLOUD RUN                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    MCP FINANCE SERVER                            │   │
│  │  ┌─────────────┐   ┌─────────────┐   ┌─────────────────────┐   │   │
│  │  │  FastAPI    │──▶│  MCP Tools  │──▶│  Technical Analysis │   │   │
│  │  │  Endpoints  │   │  (7 tools)  │   │  (150+ signals)     │   │   │
│  │  └─────────────┘   └─────────────┘   └─────────────────────┘   │   │
│  │                           │                                     │   │
│  │                           ▼                                     │   │
│  │  ┌─────────────┐   ┌─────────────┐   ┌─────────────────────┐   │   │
│  │  │  Firestore  │   │  yfinance   │   │  Gemini AI          │   │   │
│  │  │  (Cache)    │   │  (Data)     │   │  (Optional)         │   │   │
│  │  └─────────────┘   └─────────────┘   └─────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Action**: User clicks "Analyze" on a stock symbol
2. **Component**: React component calls `fetch('/api/mcp/analyze')`
3. **API Route**: Next.js API route authenticates user via Clerk
4. **Tier Check**: Route extracts user tier from Clerk metadata
5. **MCPClient**: Route calls `getMCPClient().analyzeSecurity(symbol)`
6. **Cloud Run**: MCPClient sends HTTP POST to Cloud Run service
7. **MCP Server**: Python server processes request, returns JSON
8. **Filtering**: API route filters response based on user tier
9. **Response**: Filtered data returned to component

---

## Environment Setup

### Required Environment Variables

Create a `.env.local` file in the project root:

```env
# ===========================================
# MCP CLOUD RUN CONNECTION
# ===========================================
# Local development (run mcp-finance1 locally)
MCP_CLOUD_RUN_URL=http://localhost:8000

# Production (your Cloud Run URL)
# MCP_CLOUD_RUN_URL=https://technical-analysis-api-xxxxx.run.app

# ===========================================
# CLERK AUTHENTICATION
# ===========================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# ===========================================
# DATABASE (Optional - for Max tier features)
# ===========================================
DATABASE_URL=postgresql://user:password@host:5432/database

# ===========================================
# STRIPE (Optional - for subscriptions)
# ===========================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### Local Development Setup

1. **Start the MCP backend locally:**
   ```bash
   cd ../mcp-finance1
   python -m uvicorn cloud-run.main:app --reload --port 8000
   ```

2. **Start the Next.js frontend:**
   ```bash
   cd nextjs-mcp-finance
   npm run dev
   ```

3. **Verify connection:**
   ```bash
   curl http://localhost:8000/health
   # Should return: {"status": "healthy"}
   ```

---

## MCPClient Deep Dive

### Location
`src/lib/mcp/client.ts`

### Class Structure

```typescript
export class MCPClient {
  private baseUrl: string;

  constructor() {
    // Uses environment variable or falls back to localhost
    this.baseUrl = process.env.MCP_CLOUD_RUN_URL || 'http://localhost:8000';
  }

  // Available methods...
}

// Singleton pattern
export function getMCPClient(): MCPClient {
  return new MCPClient();
}
```

### Available Methods

| Method | Endpoint | Description |
|--------|----------|-------------|
| `analyzeSecurity(symbol, period, useAi)` | `/api/analyze` | Get 150+ technical signals |
| `getTradePlan(symbol, period)` | `/api/trade-plan` | Get trade entry/stop/target |
| `scanTrades(universe, maxResults)` | `/api/scan` | Find qualified trades |
| `portfolioRisk(positions)` | `/api/portfolio-risk` | Assess portfolio risk |
| `morningBrief(watchlist, region)` | `/api/morning-brief` | Daily market briefing |
| `compareSecurity(symbols, metric)` | `/api/compare` | Compare multiple stocks |
| `screenSecurities(universe, criteria)` | `/api/screen` | Screen by criteria |

### Method Signatures

```typescript
// Analyze a security
async analyzeSecurity(
  symbol: string,           // e.g., "AAPL"
  period: string = '1mo',   // '1d', '5d', '1mo', '3mo', '6mo', '1y'
  useAi: boolean = false    // Enable AI ranking (requires Gemini API)
): Promise<AnalysisResult>

// Get trade plan
async getTradePlan(
  symbol: string,
  period: string = '1mo'
): Promise<{ trade_plans: TradePlan[]; has_trades: boolean }>

// Scan for trades
async scanTrades(
  universe: string = 'sp500',  // 'sp500', 'nasdaq100', 'etf_large_cap'
  maxResults: number = 10
): Promise<ScanResult>

// Portfolio risk assessment
async portfolioRisk(
  positions: Array<{
    symbol: string;
    shares: number;
    entry_price: number;
  }>
): Promise<PortfolioRiskResult>
```

### Error Handling

All methods throw errors on non-OK responses:

```typescript
if (!response.ok) {
  throw new Error(`MCP API error: ${response.statusText}`);
}
```

Handle errors in your API routes:

```typescript
try {
  const mcp = getMCPClient();
  const result = await mcp.analyzeSecurity(symbol);
  return NextResponse.json(result);
} catch (error) {
  console.error('MCP error:', error);
  return NextResponse.json(
    { error: 'Failed to analyze security' },
    { status: 500 }
  );
}
```

---

## API Route Pattern

### Location
`src/app/api/mcp/*/route.ts`

### Standard Pattern

Every MCP API route follows this pattern:

```typescript
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getMCPClient } from '@/lib/mcp/client';
import { TIER_LIMITS, UserTier } from '@/lib/auth/tiers';

export async function POST(request: Request) {
  try {
    // 1. AUTHENTICATE
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. GET USER TIER
    const tier = (((sessionClaims?.publicMetadata as any)?.tier as string) || 'free') as UserTier;

    // 3. PARSE REQUEST
    const body = await request.json();

    // 4. VALIDATE INPUT
    if (!body.symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    // 5. CHECK TIER ACCESS (optional)
    if (tier === 'free' && body.universe !== 'sp500') {
      return NextResponse.json({ error: 'Universe not available on free tier' }, { status: 403 });
    }

    // 6. CALL MCP SERVER
    const mcp = getMCPClient();
    const result = await mcp.analyzeSecurity(body.symbol);

    // 7. FILTER BY TIER
    const filteredResult = filterByTier(result, tier);

    // 8. RETURN RESPONSE
    return NextResponse.json({
      ...filteredResult,
      tierLimit: TIER_LIMITS[tier],
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Existing Routes

| Route | File | MCP Method |
|-------|------|------------|
| `POST /api/mcp/analyze` | `analyze/route.ts` | `analyzeSecurity()` |
| `POST /api/mcp/trade-plan` | `trade-plan/route.ts` | `getTradePlan()` |
| `POST /api/mcp/scan` | `scan/route.ts` | `scanTrades()` |
| `POST /api/mcp/portfolio-risk` | `portfolio-risk/route.ts` | `portfolioRisk()` |

---

## Adding New Endpoints

### Step 1: Add Method to MCPClient

Edit `src/lib/mcp/client.ts`:

```typescript
async myNewMethod(param1: string, param2: number): Promise<MyResultType> {
  const response = await fetch(`${this.baseUrl}/api/my-endpoint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ param1, param2 }),
  });

  if (!response.ok) {
    throw new Error(`MCP API error: ${response.statusText}`);
  }

  return response.json();
}
```

### Step 2: Add TypeScript Types

Edit `src/lib/mcp/types.ts`:

```typescript
export interface MyResultType {
  data: string;
  value: number;
  // ... other fields
}
```

### Step 3: Create API Route

Create `src/app/api/mcp/my-endpoint/route.ts`:

```typescript
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getMCPClient } from '@/lib/mcp/client';
import { TIER_LIMITS, UserTier } from '@/lib/auth/tiers';

export async function POST(request: Request) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tier = (((sessionClaims?.publicMetadata as any)?.tier as string) || 'free') as UserTier;
    const { param1, param2 } = await request.json();

    // Validate
    if (!param1) {
      return NextResponse.json({ error: 'param1 is required' }, { status: 400 });
    }

    // Call MCP
    const mcp = getMCPClient();
    const result = await mcp.myNewMethod(param1, param2);

    // Filter by tier if needed
    // ...

    return NextResponse.json(result);
  } catch (error) {
    console.error('My endpoint error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
```

### Step 4: Use in Component

```typescript
const response = await fetch('/api/mcp/my-endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ param1: 'value', param2: 123 }),
});

const data = await response.json();
```

---

## Request/Response Examples

### 1. Analyze Security

**Request:**
```bash
curl -X POST http://localhost:3000/api/mcp/analyze \
  -H "Content-Type: application/json" \
  -d '{"symbol": "AAPL", "period": "1mo"}'
```

**Response:**
```json
{
  "symbol": "AAPL",
  "timestamp": "2024-01-10T15:30:00Z",
  "price": 185.42,
  "change": 2.34,
  "signals": [
    {
      "signal": "GOLDEN CROSS",
      "desc": "50 MA crossed above 200 MA",
      "strength": "STRONG BULLISH",
      "category": "MA_CROSS",
      "rank": 1
    }
  ],
  "summary": {
    "total_signals": 47,
    "bullish": 28,
    "bearish": 19,
    "avg_score": 62.3
  },
  "indicators": {
    "rsi": 65.2,
    "macd": 0.34,
    "adx": 38.5,
    "volume": 52000000
  },
  "cached": false,
  "tierLimit": {
    "analysesPerDay": 5,
    "scansPerDay": 1,
    "scanResultsLimit": 5
  }
}
```

### 2. Get Trade Plan

**Request:**
```bash
curl -X POST http://localhost:3000/api/mcp/trade-plan \
  -H "Content-Type: application/json" \
  -d '{"symbol": "MSFT"}'
```

**Response:**
```json
{
  "trade_plans": [
    {
      "symbol": "MSFT",
      "timeframe": "swing",
      "bias": "bullish",
      "entry_price": 420.00,
      "stop_price": 410.00,
      "target_price": 445.00,
      "risk_reward_ratio": 2.5,
      "vehicle": "stock",
      "is_suppressed": false,
      "suppression_reasons": [],
      "primary_signal": "MACD BULLISH CROSS",
      "supporting_signals": ["RSI OVERSOLD RECOVERY", "VOLUME SPIKE"]
    }
  ],
  "has_trades": true
}
```

### 3. Scan Trades

**Request:**
```bash
curl -X POST http://localhost:3000/api/mcp/scan \
  -H "Content-Type: application/json" \
  -d '{"universe": "sp500", "max_results": 10}'
```

**Response:**
```json
{
  "universe": "sp500",
  "total_scanned": 500,
  "qualified_trades": [
    {
      "symbol": "NVDA",
      "entry_price": 875.00,
      "stop_price": 850.00,
      "target_price": 920.00,
      "risk_reward_ratio": 1.8,
      "bias": "bullish",
      "timeframe": "swing",
      "risk_quality": "high",
      "primary_signal": "BREAKOUT ABOVE RESISTANCE",
      "vehicle": "stock"
    }
  ],
  "timestamp": "2024-01-10T15:30:00Z",
  "duration_seconds": 12.5
}
```

### 4. Portfolio Risk

**Request:**
```bash
curl -X POST http://localhost:3000/api/mcp/portfolio-risk \
  -H "Content-Type: application/json" \
  -d '{
    "positions": [
      {"symbol": "AAPL", "shares": 100, "entry_price": 150},
      {"symbol": "MSFT", "shares": 50, "entry_price": 300}
    ]
  }'
```

**Response:**
```json
{
  "total_value": 50000,
  "total_max_loss": 2500,
  "risk_percent_of_portfolio": 5.0,
  "overall_risk_level": "MEDIUM",
  "positions": [
    {
      "symbol": "AAPL",
      "shares": 100,
      "current_price": 185.42,
      "current_value": 18542,
      "max_loss_dollar": 650,
      "max_loss_percent": 3.5,
      "risk_quality": "high"
    }
  ],
  "sector_concentration": {
    "Technology": 75,
    "Healthcare": 15,
    "Finance": 10
  },
  "hedge_suggestions": [
    "Consider UVXY hedge for portfolio protection",
    "Technology concentration above 70% - consider diversification"
  ]
}
```

---

## Tier-Based Filtering

### Tier Configuration

Located in `src/lib/auth/tiers.ts`:

```typescript
export const TIER_LIMITS: Record<UserTier, TierLimits> = {
  free: {
    analysesPerDay: 5,
    scansPerDay: 1,
    scanResultsLimit: 5,
    timeframes: ['swing'],
    universes: ['sp500'],
    features: ['basic_trade_plan', 'signal_help'],
  },
  pro: {
    analysesPerDay: 50,
    scansPerDay: 10,
    scanResultsLimit: 25,
    timeframes: ['swing', 'day', 'scalp'],
    universes: ['sp500', 'nasdaq100', 'etf_large_cap'],
    features: ['full_trade_plan', 'portfolio_risk', 'trade_journal'],
  },
  max: {
    analysesPerDay: Infinity,
    scansPerDay: Infinity,
    scanResultsLimit: 50,
    timeframes: ['swing', 'day', 'scalp'],
    universes: ['sp500', 'nasdaq100', 'etf_large_cap', 'crypto'],
    features: ['all_features', 'alerts', 'export', 'api_access'],
  },
};
```

### Filtering in API Routes

```typescript
// Filter signals based on tier
let filteredSignals = result.signals || [];
if (tier === 'free') {
  filteredSignals = filteredSignals.slice(0, 3);  // Top 3 only
} else if (tier === 'pro') {
  filteredSignals = filteredSignals.slice(0, 10); // Top 10
}
// Max tier sees all signals

// Filter timeframes
if (tier === 'free') {
  result.trade_plans = result.trade_plans.filter(
    (plan) => plan.timeframe === 'swing'
  );
}

// Block features
if (tier !== 'max' && feature === 'hedge_suggestions') {
  delete result.hedge_suggestions;
}
```

### Helper Functions

```typescript
import { canAccessFeature, canAccessTimeframe, canAccessUniverse } from '@/lib/auth/tiers';

// Check feature access
if (!canAccessFeature(tier, 'portfolio_risk')) {
  return NextResponse.json({ error: 'Pro tier required' }, { status: 403 });
}

// Check timeframe access
if (!canAccessTimeframe(tier, 'scalp')) {
  return NextResponse.json({ error: 'Scalp trades require Pro tier' }, { status: 403 });
}

// Check universe access
if (!canAccessUniverse(tier, 'crypto')) {
  return NextResponse.json({ error: 'Crypto requires Max tier' }, { status: 403 });
}
```

---

## Testing & Debugging

### Test with curl

```bash
# Test analyze endpoint
curl -X POST http://localhost:3000/api/mcp/analyze \
  -H "Content-Type: application/json" \
  -d '{"symbol": "AAPL"}'

# Test with authentication (get token from browser dev tools)
curl -X POST http://localhost:3000/api/mcp/analyze \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=YOUR_SESSION_TOKEN" \
  -d '{"symbol": "AAPL"}'
```

### Debug MCP Connection

```typescript
// Add logging to MCPClient
async analyzeSecurity(symbol: string, period = '1mo', useAi = false) {
  console.log(`[MCP] Calling ${this.baseUrl}/api/analyze`);
  console.log(`[MCP] Payload:`, { symbol, period, use_ai: useAi });

  const response = await fetch(...);

  console.log(`[MCP] Response status: ${response.status}`);
  const data = await response.json();
  console.log(`[MCP] Response data:`, data);

  return data;
}
```

### Common Debug Scenarios

1. **Check if MCP server is running:**
   ```bash
   curl http://localhost:8000/health
   ```

2. **Check environment variable:**
   ```typescript
   console.log('MCP URL:', process.env.MCP_CLOUD_RUN_URL);
   ```

3. **Check Clerk auth:**
   ```typescript
   const { userId, sessionClaims } = await auth();
   console.log('User ID:', userId);
   console.log('Tier:', sessionClaims?.publicMetadata?.tier);
   ```

---

## Production Deployment

### Vercel Configuration

1. **Set environment variables in Vercel dashboard:**
   - `MCP_CLOUD_RUN_URL` = Your Cloud Run URL
   - `CLERK_SECRET_KEY` = Your Clerk secret
   - `DATABASE_URL` = Your PostgreSQL connection string

2. **Verify Cloud Run is accessible:**
   ```bash
   curl https://your-service-xxxxx.run.app/health
   ```

### Cloud Run Setup

1. **Deploy MCP server to Cloud Run:**
   ```bash
   cd mcp-finance1
   gcloud run deploy technical-analysis-api \
     --source . \
     --region us-central1 \
     --allow-unauthenticated
   ```

2. **Get the service URL:**
   ```bash
   gcloud run services describe technical-analysis-api \
     --region us-central1 \
     --format 'value(status.url)'
   ```

3. **Update Vercel env with the URL**

---

## Troubleshooting

### Connection Refused

**Error:** `ECONNREFUSED 127.0.0.1:8000`

**Solution:** Start the MCP server locally or set `MCP_CLOUD_RUN_URL` to your Cloud Run URL.

### CORS Errors

**Error:** `Access-Control-Allow-Origin` errors

**Solution:** Cloud Run should handle CORS. For local dev, ensure the FastAPI server has CORS middleware:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 401 Unauthorized

**Error:** API returns 401

**Solution:** User not signed in. Check Clerk setup and ensure auth middleware is working.

### 403 Tier Access Denied

**Error:** Feature requires higher tier

**Solution:** User's tier doesn't have access. Check tier in Clerk dashboard under user's public metadata.

### 500 Internal Server Error

**Steps:**
1. Check Next.js console for error details
2. Check MCP server logs: `gcloud run logs read --service=technical-analysis-api`
3. Verify request payload format matches expected schema

### Cold Start Delays

Cloud Run containers may take 2-5 seconds to start after inactivity.

**Solution:**
- Set minimum instances to 1 in Cloud Run
- Add loading states in frontend
- Consider using Cloud Run's "always on" CPU option

---

## Summary

| Component | Location | Purpose |
|-----------|----------|---------|
| MCPClient | `src/lib/mcp/client.ts` | HTTP calls to Cloud Run |
| Types | `src/lib/mcp/types.ts` | TypeScript interfaces |
| Tiers | `src/lib/auth/tiers.ts` | Tier limits and helpers |
| API Routes | `src/app/api/mcp/*/route.ts` | Auth + filtering layer |
| Environment | `.env.local` | Configuration |

For questions or issues, check the [GitHub Issues](https://github.com/your-repo/issues).
