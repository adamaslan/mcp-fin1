# Testing Guide - Next.js MCP Finance Dashboard

## Pre-Testing Setup

### 1. Environment Variables

Create a `.env.local` file in the project root:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_XXXXX
CLERK_SECRET_KEY=sk_test_XXXXX
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# MCP Cloud Run
MCP_CLOUD_RUN_URL=https://technical-analysis-api-XXXXX.run.app

# Database (optional for testing - uses in-memory by default)
DATABASE_URL=postgresql://user:password@localhost:5432/mcp_finance
```

### 2. Start Development Server

```bash
npm run dev
```

Server runs at `http://localhost:3000`

---

## Tier Experience Testing

### Free Tier Testing

**Setup:**
1. Create new account in development
2. Verify Clerk metadata shows `tier: 'free'`

**Test Cases:**

- [ ] **Landing Page Access**
  - Navigate to `/` - should display full landing page
  - Verify "Get Started" button navigates to `/sign-in`

- [ ] **Analyze Feature**
  - Go to `/dashboard/analyze/AAPL`
  - Verify trade plan loads
  - Verify stop price and target price are **blurred**
  - Verify R:R ratio is **blurred**
  - Verify signals show only **top 3** (Free limit)
  - Search different symbol: should work (5/day limit applies server-side)

- [ ] **Scanner Feature**
  - Go to `/dashboard/scanner`
  - Select universe (sp500 only available)
  - Verify results limited to **5 results** (Free limit)
  - Verify message: "Results limited to 5 for Free tier"

- [ ] **Watchlist**
  - Can create **1 watchlist** (Free limit)
  - Can add up to **10 symbols** per watchlist
  - Attempt to create 2nd watchlist - should show message about limit

- [ ] **Blocked Features**
  - Try accessing `/portfolio` - should redirect to pricing
  - Try accessing `/journal` - should redirect to pricing
  - Try accessing `/alerts` - should redirect to pricing
  - Try accessing `/export` - should redirect to pricing
  - Try accessing `/signals` - should redirect to pricing
  - Sidebar should show these with "Free" badges and disabled state

- [ ] **Timeframes (Analyze)**
  - Only "Swing" timeframe available
  - "Day" and "Scalp" buttons disabled with "Pro+" badge

---

### Pro Tier Testing

**Setup:**
1. Admin updates user tier to "pro" via Clerk dashboard or API
2. Clear browser cache / re-login
3. Verify Clerk metadata shows `tier: 'pro'`

**Test Cases:**

- [ ] **Analyze Feature (Unlocked)**
  - Go to `/dashboard/analyze/AAPL`
  - Verify trade plan details are **NOT blurred**
  - Entry, stop, target, R:R all visible
  - Signals show **top 10** (Pro limit, up from 3)

- [ ] **Timeframe Selection**
  - All 3 timeframes available: Swing, Day, Scalp
  - Switch between timeframes - data updates accordingly
  - Verify different trade plans for different timeframes

- [ ] **Portfolio Feature**
  - Navigate to `/dashboard/portfolio`
  - Should load without redirect
  - Add sample position: TSLA, 50 shares, $200 entry
  - Verify portfolio risk calculates and displays
  - Risk dashboard shows: Total Value, Max Loss, Risk Level, Risk Ratio

- [ ] **Trade Journal**
  - Navigate to `/dashboard/journal`
  - Log new trade with form
  - Verify trade appears in "Open Trades"
  - Close trade with exit price
  - Verify P&L calculated correctly
  - Statistics update: Total P&L, Win Rate, Closed Trades

- [ ] **Watchlist (Multiple)**
  - Create **5 watchlists** (Pro limit)
  - Add **50 symbols per watchlist** (Pro limit)
  - Attempt to create 6th - should show limit message

- [ ] **Scanner Results**
  - Scan results limited to **25** (Pro limit, up from 5)
  - Multiple scans per day allowed (**10/day** limit)

- [ ] **Blocked Features (Max Only)**
  - Alerts, Export, Signals still redirect/disabled with "Max" badges
  - Sidebar shows all 3 with disabled state

---

### Max Tier Testing

**Setup:**
1. Admin updates user tier to "max"
2. Clear browser cache / re-login
3. Verify Clerk metadata shows `tier: 'max'`

**Test Cases:**

- [ ] **All Pro Features Available**
  - All Portfolio, Journal, Timeframes work
  - Watchlists unlimited
  - Scanner results up to **50** (Max limit)

- [ ] **Alerts Feature**
  - Navigate to `/dashboard/alerts`
  - Should load without redirect
  - Create alert: AAPL, Price Above, $160
  - Verify alert appears in list with status "Active"
  - Toggle to "Inactive" - status updates
  - Create 2nd alert, 3rd alert - unlimited allowed
  - Delete alert - removed from list

- [ ] **Export Feature**
  - Navigate to `/dashboard/export`
  - Click "Export CSV"
  - Verify file downloads with trade data
  - Open CSV - verify headers and data format
  - Click "Export JSON"
  - Verify JSON file downloads with complete data structure
  - JSON includes: exportDate, summary (totalTrades, winRate, totalPnL), trades array, positions array

- [ ] **Signals Feature**
  - Navigate to `/dashboard/signals`
  - Verify list shows sample signals (RSI, MACD, Bollinger Bands)
  - Search for "RSI" - filters results
  - Filter by category "Momentum" - shows only momentum signals
  - Verify all signals display calculation values
  - No tier restrictions - full feature access

- [ ] **Portfolio Risk + Hedge Suggestions**
  - Go to `/portfolio`
  - Verify hedge suggestions section appears (if high risk)
  - Suggestions include action (buy_put, buy_call, reduce_position, diversify)
  - Each suggestion shows: symbol, action, rationale, estimated cost, protection level

- [ ] **Usage Limits**
  - Analyses/day: Unlimited
  - Scans/day: Unlimited
  - Results: 50 max per scan
  - No timeframe restrictions
  - No universe restrictions (if crypto universe exists)
  - No feature access restrictions

---

## Tier Gating Component Testing

### TierGate Component

- [ ] **Blurred Content**
  - View page with TierGate wrapper as Free tier
  - Verify content shows with 50% opacity blur
  - Upgrade CTA visible with lock icon

- [ ] **Feature Access**
  - Pro features hidden to Free tier
  - Max features hidden to Free/Pro tiers
  - No errors in console

- [ ] **Navigation Blocking**
  - Sidebar items disabled for inaccessible tiers
  - Clicking disabled items doesn't navigate
  - Badge shows required tier (e.g., "PRO+", "MAX")

---

## API Route Testing

### Using curl or Postman:

**Analyze Route** (`POST /api/mcp/analyze`)
```bash
curl -X POST http://localhost:3000/api/mcp/analyze \
  -H "Content-Type: application/json" \
  -d '{"symbol":"AAPL","period":"1mo","useAi":true}'
```
- [ ] Free tier: top 3 signals only
- [ ] Pro tier: top 10 signals
- [ ] Max tier: all signals

**Trade Plan Route** (`POST /api/mcp/trade-plan`)
```bash
curl -X POST http://localhost:3000/api/mcp/trade-plan \
  -H "Content-Type: application/json" \
  -d '{"symbol":"AAPL","period":"1mo"}'
```
- [ ] Filters by selected timeframe
- [ ] Free tier: swing only
- [ ] Pro/Max tier: all timeframes

**Portfolio Risk Route** (`POST /api/mcp/portfolio-risk`)
```bash
curl -X POST http://localhost:3000/api/mcp/portfolio-risk \
  -H "Content-Type: application/json" \
  -d '{"positions":[{"symbol":"AAPL","shares":100,"entry_price":150}]}'
```
- [ ] Free tier: returns 403 Forbidden
- [ ] Pro tier: returns risk data, NO hedge suggestions
- [ ] Max tier: returns risk data WITH hedge suggestions

**Alerts Route** (`GET /api/alerts`)
```bash
curl -X GET http://localhost:3000/api/alerts
```
- [ ] Free tier: returns 403
- [ ] Pro tier: returns 403
- [ ] Max tier: returns user's alerts array

**Export Route** (`GET /api/export?format=csv`)
```bash
curl -X GET "http://localhost:3000/api/export?format=json"
```
- [ ] Free/Pro tier: returns 403
- [ ] Max tier: returns JSON file with trade data

---

## Database Testing (When Connected)

### Cloud SQL Setup

1. Create PostgreSQL database on Cloud SQL
2. Update `DATABASE_URL` in `.env.local`
3. Run migrations: `npm run db:migrate`

**Test Cases:**

- [ ] Create user: `users` table entry created on first login
- [ ] Create watchlist: stored in `watchlists` table with user_id
- [ ] Add position: stored in `positions` table
- [ ] Log trade: stored in `trade_journal` table
- [ ] Create alert: stored in `alerts` table
- [ ] Track usage: `usage_tracking` updated on each API call

**Queries to verify:**
```sql
SELECT * FROM users WHERE clerk_id = 'user_XXXXX';
SELECT * FROM watchlists WHERE user_id = 'user_XXXXX';
SELECT * FROM trade_journal WHERE user_id = 'user_XXXXX';
SELECT * FROM alerts WHERE user_id = 'user_XXXXX' AND is_active = true;
```

---

## MCP Integration Testing

### Cloud Run API

1. Get Cloud Run endpoint URL
2. Update `MCP_CLOUD_RUN_URL` in `.env.local`
3. Test endpoints match Python server signatures

**Verify Responses:**

- [ ] `POST /analyze` returns `AnalysisResult` with signals array
- [ ] `POST /trade-plan` returns `TradePlan` array
- [ ] `POST /scan` returns `QualifiedTrade` array
- [ ] `POST /portfolio-risk` returns `PortfolioRiskResult` with hedge_suggestions
- [ ] `POST /morning-brief` returns market summary
- [ ] Error handling: non-200 responses trigger client-side error states

---

## Performance Testing

### Load Times

- [ ] Landing page loads in < 3s
- [ ] Dashboard pages load in < 2s
- [ ] API calls return in < 5s (MCP dependent)
- [ ] Image optimization working (use DevTools)

### Memory Usage

- [ ] No memory leaks on page navigation
- [ ] Long lists render efficiently (virtualization if needed)
- [ ] State management doesn't grow unbounded

---

## Security Testing

- [ ] Clerk session required for `/dashboard` routes
- [ ] Tier metadata cannot be spoofed by client
- [ ] API routes validate tier server-side
- [ ] No sensitive data exposed in console
- [ ] CORS headers correct for Cloud Run calls
- [ ] Environment variables not exposed in client code

---

## Browser Compatibility

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

---

## Testing Checklist Summary

```
Free Tier:
- [ ] Landing page
- [ ] Analyze (blurred fields, 3 signals)
- [ ] Scanner (5 results, sp500 only)
- [ ] Watchlist (1 watchlist, 10 symbols)
- [ ] Timeframes (swing only)
- [ ] Blocked features redirect to pricing

Pro Tier:
- [ ] All Free features unblurred
- [ ] Portfolio visible & working
- [ ] Journal visible & working
- [ ] Timeframes (all 3)
- [ ] Watchlists (5 allowed)
- [ ] Scanner (25 results)
- [ ] Signals still blocked (Max only)

Max Tier:
- [ ] All Pro features
- [ ] Alerts CRUD operations
- [ ] Export CSV & JSON
- [ ] Signals search & filter
- [ ] Hedge suggestions in portfolio
- [ ] Unlimited scans/analyses
```

---

## Testing Notes

- Use Clerk's test mode for automated testing
- Mock Cloud Run responses in tests for CI/CD
- Database can be tested with Docker PostgreSQL
- Use Vercel Preview Deployments for staging before production
