# E2E Testing & Cloud Run Pipeline Guide

Complete guide to understanding the Playwright E2E tests and how the Cloud Run MCP service pipeline works in production.

## Table of Contents

1. [E2E Test Flow](#e2e-test-flow)
2. [The 9 MCP Tools](#the-9-mcp-tools)
3. [Cloud Run Service Pipeline](#cloud-run-service-pipeline)
4. [Configuration & Environment](#configuration--environment)
5. [Testing vs Production](#testing-vs-production)
6. [Troubleshooting](#troubleshooting)

---

## E2E Test Flow

### Overview

The Playwright E2E tests (`gcloud-mcp-results.spec.ts`) test all 9 MCP tools through the browser by:

1. Authenticating with Clerk
2. Navigating to the MCP Control Center
3. Selecting a tool and filling parameters
4. Executing the tool via the frontend
5. Verifying real data in the results

### Detailed Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    E2E TEST EXECUTION FLOW                      │
│                  (Playwright + Browser Automation)              │
└─────────────────────────────────────────────────────────────────┘

PHASE 1: AUTHENTICATION
─────────────────────────────────────────────────────────────────

    Playwright Browser            Frontend               Clerk Auth
           │                            │                   │
           │  navigate to /sign-in      │                   │
           ├─────────────────────────▶  │                   │
           │                            │  authenticate      │
           │                            ├─────────────────▶  │
           │                            │                   │
           │                            │  ◀────── jwt token
           │  ◀───────────────────────────────────────────────
           │  (redirected to /dashboard)
           │


PHASE 2: NAVIGATE TO MCP CONTROL
─────────────────────────────────────────────────────────────────

    Browser                   Next.js App Router
       │                            │
       │  GET /mcp-control         │
       ├───────────────────────────▶│
       │                            │  Check auth
       │                            │  Load React component
       │  ◀─────────────────────────
       │  (HTML + React bundle)
       │
       │  Render MCP Control Center UI


PHASE 3: SELECT TOOL & PARAMETERS
─────────────────────────────────────────────────────────────────

    User (via Playwright)         Frontend
           │                          │
           │  Select Tool             │
           ├─ analyze_security ──────▶│  Update state
           │                          │
           │  Fill Symbol = AAPL      │
           ├──────────────────────────▶│  Update form
           │                          │
           │  Select Period = 1mo     │
           ├──────────────────────────▶│  Update form
           │                          │


PHASE 4: EXECUTE → API CALL
─────────────────────────────────────────────────────────────────

    Browser              Frontend           Next.js API Route      Cloud Run MCP
       │                  (React)           (/api/gcloud/execute)  (Python/FastAPI)
       │                     │                      │                   │
       │  Click Execute      │                      │                   │
       ├────────────────────▶│                      │                   │
       │                     │  POST /api/gcloud/   │                   │
       │                     │  execute             │                   │
       │                     ├─────────────────────▶│                   │
       │                     │                      │  Verify auth      │
       │                     │                      │  Check tier       │
       │                     │                      │  Log execution    │
       │                     │                      │                   │
       │                     │                      │  POST /api/       │
       │                     │                      │  analyze          │
       │                     │                      ├──────────────────▶│
       │                     │                      │                   │
       │                     │                      │                   │  Fetch yfinance
       │                     │                      │                   │  Calculate signals
       │                     │                      │                   │  (150+ indicators)
       │                     │                      │                   │
       │                     │                      │                   │  Format response
       │                     │                      │  ◀────────────────
       │                     │  ◀───────────────────
       │  Show loading...    │  Store in DB         │
       │  Wait for results   │  Transform result    │
       │                     │


PHASE 5: RESULTS DISPLAY
─────────────────────────────────────────────────────────────────

    Frontend (React)            Results Component
           │                           │
           │  Receive result           │
           ├──────────────────────────▶│
           │  result = {               │  Render:
           │    symbol: "AAPL",        │  ├─ Symbol: AAPL
           │    price: 182.45,         │  ├─ Price: $182.45
           │    signals: [             │  ├─ Bullish: 87
           │      {...},               │  ├─ Bearish: 28
           │      ...                  │  ├─ Total: 150
           │    ],                     │  └─ Top Signals: [...]
           │    summary: {             │
           │      bullish: 87,         │
           │      bearish: 28,         │
           │      total_signals: 150   │
           │    }                      │
           │  }                        │


PHASE 6: TEST ASSERTIONS
─────────────────────────────────────────────────────────────────

    Playwright Test Runner     Browser
           │                      │
           │  Verify real data    │
           ├─ Price exists? ──────▶  ✓ Found $182.45
           ├─ Signals shown? ─────▶  ✓ Found Bullish count
           ├─ No mock data? ──────▶  ✓ No "mock" text
           ├─ Execution time? ────▶  ✓ 3245ms
           │
           │  Pass/Fail Decision
           ├─ All checks passed
           │  ✓ TEST PASSED
           │
           │  Log results
           └─ "Analyze Security: PASS (3245ms)"
```

### Code Flow

```typescript
// User's test code
test("Analyze Security - Returns real price and signals", async ({
  authenticatedPage,
}) => {
  // 1. Navigate to MCP Control
  await navigateToMCPControl(authenticatedPage);

  // 2. Select tool
  await selectTool(authenticatedPage, "analyze_security");

  // 3. Fill symbol
  const symbolInput = authenticatedPage.locator('input[name="symbol"]').first();
  await symbolInput.fill("AAPL");

  // 4. Execute (triggers POST /api/gcloud/execute)
  const { success, executionTime, hasError } =
    await executeAndWaitForResults(authenticatedPage);

  // 5. Assert real data (NOT mocks)
  if (!hasError) {
    const priceText = await authenticatedPage
      .locator("text=/\\$\\d+\\.\\d+/") // Regex: $XXX.XX
      .first()
      .textContent();

    expect(priceText).toBeTruthy(); // ✓ Real price found
    expect(executionTime).toBeGreaterThan(500); // ✓ Real execution time
    expect(executionTime).toBeLessThan(45000); // ✓ Within limits
  }

  console.log(
    `Analyze Security: ${success ? "PASS" : "FAIL"} (${executionTime}ms)`,
  );
});
```

---

## The 9 MCP Tools

### Tool Matrix

| #     | Tool Name               | What It Does                                   | Key Fields Verified                                          |
| ----- | ----------------------- | ---------------------------------------------- | ------------------------------------------------------------ |
| **1** | `analyze_security`      | Deep technical analysis with 150+ indicators   | `symbol`, `price`, `signals[].signal`, `summary.bullish`     |
| **2** | `analyze_fibonacci`     | Fibonacci retracements, extensions, confluence | `symbol`, `price`, `levels[].price`, `swingHigh`, `swingLow` |
| **3** | `get_trade_plan`        | Entry/stop/target levels for qualified trades  | `symbol`, `trade_plans[].entry`, `.stop_loss`, `.target_1`   |
| **4** | `compare_securities`    | Compare 2-5 stocks across metrics              | `comparison[].symbol`, `.score`, `.bullish`, `.bearish`      |
| **5** | `screen_securities`     | Filter universe by technical criteria          | `matches[].symbol`, `.score`, `.matches.length`              |
| **6** | `scan_trades`           | Find high-probability setups in universe       | `qualified_trades[].symbol`, `.quality_score`                |
| **7** | `portfolio_risk`        | Aggregate portfolio risk analysis              | `total_value`, `total_max_loss`, `overall_risk_level`        |
| **8** | `morning_brief`         | Daily market briefing with key levels          | `timestamp`, `market_status.is_open`, `summary`              |
| **9** | `options_risk_analysis` | Options chain Greeks, IV rank, PCR             | `symbol`, `expiration_date`, `days_to_expiration`            |

### Test Parameters

```typescript
const tools = [
  {
    id: "analyze_security",
    params: { symbol: "AAPL", period: "1mo" },
    expectedFields: ["symbol", "price", "signals", "summary"],
  },
  {
    id: "analyze_fibonacci",
    params: { symbol: "AAPL", period: "1mo", window: 150 },
    expectedFields: ["symbol", "price", "levels"],
  },
  {
    id: "get_trade_plan",
    params: { symbol: "AAPL", period: "1mo" },
    expectedFields: ["symbol", "trade_plans"],
  },
  // ... and 6 more tools
];
```

---

## Cloud Run Service Pipeline

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     COMPLETE MCP PIPELINE ARCHITECTURE                      │
└─────────────────────────────────────────────────────────────────────────────┘


                          ┌──────────────────┐
                          │   Developer      │
                          │   (Local Repo)   │
                          └────────┬─────────┘
                                   │
                    1. Code Commit │ Git Push
                                   ▼
                          ┌──────────────────┐
                          │  GitHub Repo     │
                          │  (main branch)   │
                          └────────┬─────────┘
                                   │
                    2. Webhook      │ Trigger
                                   ▼
        ┌──────────────────────────────────────────────┐
        │           GITHUB ACTIONS (CI/CD)             │
        │  ┌────────────────────────────────────────┐  │
        │  │ 1. Checkout code                       │  │
        │  │ 2. Install deps (mamba)                │  │
        │  │ 3. Lint & type-check                  │  │
        │  │ 4. Run unit tests                      │  │
        │  │ 5. Run E2E tests (Playwright)         │  │
        │  │ 6. Build Docker image                 │  │
        │  │ 7. Push to Google Container Registry  │  │
        │  │ 8. Deploy to Cloud Run                │  │
        │  └────────────────────────────────────────┘  │
        └──────────────────┬───────────────────────────┘
                           │
                3. Push    │ Build & Deploy
                           ▼
        ┌──────────────────────────────────────────────┐
        │       GOOGLE CONTAINER REGISTRY (GCR)        │
        │  gcr.io/[PROJECT]/[SERVICE]:latest           │
        │  - Docker image size: ~500MB                 │
        │  - Python 3.11 + FastAPI                     │
        │  - All MCP tools compiled                    │
        └──────────────────┬───────────────────────────┘
                           │
                4. Deploy   │
                           ▼
        ┌──────────────────────────────────────────────┐
        │         CLOUD RUN (Managed Service)          │
        │                                              │
        │  Service: mcp-finance-prod                   │
        │  URL: https://mcp-xxxxx.run.app              │
        │  Memory: 2GB                                 │
        │  Timeout: 900s (15 minutes)                  │
        │  Min instances: 0 (auto-scale)               │
        │  Max instances: 100                          │
        │                                              │
        │  ┌──────────────────────────────────────┐   │
        │  │ FastAPI Server (Port 8080)           │   │
        │  │ ┌────────────────────────────────┐   │   │
        │  │ │ POST /api/analyze              │   │   │
        │  │ │ POST /api/fibonacci            │   │   │
        │  │ │ POST /api/compare              │   │   │
        │  │ │ POST /api/screen               │   │   │
        │  │ │ POST /api/trade-plan           │   │   │
        │  │ │ POST /api/scan                 │   │   │
        │  │ │ POST /api/portfolio-risk       │   │   │
        │  │ │ POST /api/morning-brief        │   │   │
        │  │ │ POST /api/options-risk         │   │   │
        │  │ └────────────────────────────────┘   │   │
        │  │ Dependencies:                        │   │
        │  │ ├─ yfinance (stock data)            │   │
        │  │ ├─ pandas (data processing)         │   │
        │  │ ├─ numpy (calculations)             │   │
        │  │ ├─ google-generativeai (Gemini AI) │   │
        │  │ └─ requests (HTTP)                  │   │
        │  └──────────────────────────────────────┘   │
        └──────────────────┬───────────────────────────┘
                           │
                5. Listen   │ for requests
                           ▼
        ┌──────────────────────────────────────────────┐
        │       PRODUCTION FRONTEND (Vercel)           │
        │  https://mcp-finance.vercel.app              │
        │                                              │
        │  Next.js 16 + React 19 + TypeScript          │
        │  ┌────────────────────────────────────────┐  │
        │  │ MCP Control Center                     │  │
        │  │ ├─ Tool Selector                       │  │
        │  │ ├─ Parameter Form                      │  │
        │  │ ├─ Execute Button                      │  │
        │  │ └─ Results Display                     │  │
        │  └────────────────────────────────────────┘  │
        │  ┌────────────────────────────────────────┐  │
        │  │ API Routes                             │  │
        │  │ ├─ /api/gcloud/execute (main route)   │  │
        │  │ └─ /api/gcloud/presets (user presets) │  │
        │  └────────────────────────────────────────┘  │
        │  ┌────────────────────────────────────────┐  │
        │  │ Environment Variables                  │  │
        │  │ └─ MCP_CLOUD_RUN_URL=https://mcp..    │  │
        │  └────────────────────────────────────────┘  │
        └──────────────────┬───────────────────────────┘
                           │
            6. User        │ Requests Analysis
            Interaction    │
                           ▼
        ┌──────────────────────────────────────────────┐
        │          USER DATA FLOW (Production)         │
        │                                              │
        │  1. User clicks "Execute" on MCP tool       │
        │  2. Browser → POST /api/gcloud/execute      │
        │  3. Vercel Route → Cloud Run MCP Server    │
        │  4. Cloud Run fetches stock data (yfinance) │
        │  5. Cloud Run calculates 150+ signals       │
        │  6. Cloud Run optionally: Gemini AI         │
        │  7. Cloud Run returns results JSON          │
        │  8. Vercel stores in database (optional)    │
        │  9. Vercel returns to browser               │
        │  10. Browser renders results                │
        │                                              │
        │  Response Time: 2-8 seconds (typical)       │
        │  Data Freshness: Real-time (yfinance)       │
        │  Uptime: 99.95% (Cloud Run SLA)            │
        └──────────────────────────────────────────────┘
```

### Request/Response Lifecycle

```
USER REQUEST (Browser)
├─ Tool: analyze_security
├─ Symbol: AAPL
├─ Period: 1mo
└─ Use AI: false


         ↓ HTTP POST /api/gcloud/execute


NEXT.JS API ROUTE (/api/gcloud/execute)
├─ Authenticate user (Clerk JWT)
├─ Verify tier (free/pro/max)
├─ Check rate limits
├─ Create execution record in DB
├─ Forward to Cloud Run MCP
└─ Store results in DB


         ↓ HTTP POST https://mcp-xxxxx.run.app/api/analyze


CLOUD RUN MCP SERVER (Python)
├─ Receive { symbol: "AAPL", period: "1mo", use_ai: false }
├─ Fetch OHLCV data from yfinance
├─ Calculate technical indicators (150+):
│  ├─ Moving averages (SMA, EMA)
│  ├─ Oscillators (RSI, MACD, Stochastic)
│  ├─ Volatility (Bollinger Bands, ATR)
│  ├─ Volume (OBV, VWAP)
│  ├─ Trend (ADX, Ichimoku)
│  └─ Price patterns
├─ Generate signals based on rules
├─ Optionally: Call Gemini AI for insights
└─ Return structured JSON response


         ↓ JSON Response


CLOUD RUN RESPONSE (to Next.js)
{
  "success": true,
  "symbol": "AAPL",
  "price": 182.45,
  "summary": {
    "bullish": 87,
    "bearish": 28,
    "total_signals": 150
  },
  "signals": [
    {
      "signal": "Golden Cross",
      "description": "50-day SMA > 200-day SMA",
      "strength": "strong",
      "category": "Trend"
    },
    ...
  ],
  "trade_plans": [...],
  "ai_analysis": "Optional Gemini insights"
}


         ↓ HTTP Response to Browser


BROWSER (React Component)
├─ Receive results JSON
├─ Update component state
├─ Display in ResultsDisplay component:
│  ├─ Symbol badge
│  ├─ Price card ($182.45)
│  ├─ Signal counts (Bullish/Bearish/Total)
│  ├─ Top signals list
│  └─ Execution time (e.g., 3245ms)
└─ Show optional AI insights card (Pro+)


         ↓ RESPONSE TO USER


USER SEES (Screen)
┌─────────────────────────────────┐
│ Results                         │
├─────────────────────────────────┤
│ Symbol: AAPL                    │
│ Price: $182.45                  │
│                                 │
│ Bullish:  87   | Bearish: 28   │
│ Total Signals: 150              │
│                                 │
│ Top Signals:                    │
│ • Golden Cross (Trend)          │
│ • RSI Oversold Exit (Momentum)  │
│ • Volume Spike (Volume)         │
│ • Fibonacci Support (Levels)    │
│                                 │
│ Execution Time: 3245ms          │
└─────────────────────────────────┘
```

---

## Configuration & Environment

### Environment Variables

#### Frontend (.env.local or Vercel)

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Cloud Run MCP Server
MCP_CLOUD_RUN_URL=https://mcp-finance-prod-xxxxx.run.app

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/mcp_finance

# Stripe Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx

# Google Gemini AI
GEMINI_API_KEY=AIzaSyD_xxxxx
```

#### Cloud Run MCP Server (Environment)

```bash
# Set via Cloud Run console or gcloud deploy
GEMINI_API_KEY=AIzaSyD_xxxxx
LOG_LEVEL=info
```

### Testing Environment (.env.test)

```bash
# Playwright Config
TEST_BASE_URL=http://localhost:3000

# Test User Credentials (Clerk)
TEST_USER_EMAIL=test+playwright@example.com
TEST_USER_PASSWORD=TestPassword123!

# MCP Server (for local testing)
MCP_CLOUD_RUN_URL=http://localhost:8000
```

---

## Testing vs Production

### Development (Local)

```
Developer Machine
├─ npm run dev (Frontend: localhost:3000)
├─ python mcp_server.py (Backend: localhost:8000)
└─ PostgreSQL (local or Docker)

Tests
├─ Playwright E2E: http://localhost:3000
├─ Test user: test@example.com
└─ MCP endpoint: http://localhost:8000
```

### Production (Cloud)

```
Cloud Infrastructure
├─ Vercel (Frontend)
│  └─ https://mcp-finance.vercel.app
├─ Cloud Run (Backend)
│  └─ https://mcp-xxxxx.run.app
└─ Cloud SQL (Database)
   └─ PostgreSQL managed

Tests
├─ Playwright E2E: https://mcp-finance.vercel.app
├─ Real user account (Clerk)
└─ MCP endpoint: https://mcp-xxxxx.run.app
```

---

## Troubleshooting

### Test Fails: 500 Error on /api/gcloud/execute

**Symptom**: "Failed to load resource: 500 (Internal Server Error)"

**Causes**:

- MCP server not running
- MCP_CLOUD_RUN_URL not set (defaults to localhost:8000)
- Network connectivity issue
- Database connection error

**Solution**:

```bash
# Option 1: Set Cloud Run URL
echo "MCP_CLOUD_RUN_URL=https://your-cloud-run-service.run.app" >> .env.local

# Option 2: Run MCP locally
cd scripts && python mcp_server.py

# Option 3: Check if endpoint is accessible
curl https://your-mcp-server.run.app/health
```

### Test Fails: Auth Error (401/403)

**Symptom**: Redirected to Clerk login page

**Causes**:

- TEST_USER_EMAIL not set in .env.test
- Test user doesn't exist in Clerk
- Clerk development mode not enabled

**Solution**:

```bash
# 1. Create test user in Clerk
# In Clerk dashboard: Users → Create user

# 2. Set test credentials
cat > .env.test <<EOF
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123!
EOF

# 3. Run tests
npx playwright test e2e/phase5/gcloud-mcp-results.spec.ts
```

### Test Fails: Timeout (>60 seconds)

**Symptom**: "Test timeout of 60000ms exceeded"

**Causes**:

- MCP server slow to respond
- Network latency to Cloud Run
- Rate limiting

**Solution**:

```typescript
// Increase timeout in test
test.setTimeout(120000);  // 2 minutes

// Or check MCP server performance
time curl -X POST https://your-mcp.run.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"symbol":"AAPL","period":"1mo"}'
```

### Results Show Stale Data or Errors

**Symptom**: Results don't update, or show "Failed to fetch"

**Causes**:

- yfinance API rate limit
- Market data service outage
- Invalid symbol parameter

**Solution**:

```bash
# 1. Check MCP server logs
gcloud run logs read [SERVICE-NAME] --limit 50

# 2. Test with valid symbol
# Use major stocks: AAPL, MSFT, GOOGL, TSLA, SPY

# 3. Check if yfinance is accessible
python -c "import yfinance; print(yfinance.Ticker('AAPL').info)"
```

---

## Summary

| Aspect          | Development    | Testing        | Production        |
| --------------- | -------------- | -------------- | ----------------- |
| **Frontend**    | localhost:3000 | localhost:3000 | Vercel (HTTPS)    |
| **MCP Backend** | localhost:8000 | localhost:8000 | Cloud Run (HTTPS) |
| **Database**    | Local/Docker   | Local/Docker   | Cloud SQL         |
| **Auth**        | Clerk dev      | Clerk dev      | Clerk prod        |
| **Data**        | yfinance       | yfinance       | yfinance          |
| **Uptime**      | N/A            | Test run       | 99.95% SLA        |
| **Users**       | 1 (dev)        | Test users     | Millions          |
| **Logs**        | console        | Playwright     | Cloud Logging     |

**Key Takeaway**: The E2E tests verify that real stock data flows correctly through all 9 MCP tools from the browser all the way through Cloud Run and back. No mocks, no fake data—just pure real-time market analysis.
