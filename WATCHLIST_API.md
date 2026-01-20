# Watchlist & Analysis API - Integration Guide

This document describes the new watchlist API endpoints and their integration with the analyze feature, with enhanced capabilities for Pro/Max tier users.

## Fixed Issues

1. **404 Error: POST /dashboard/watchlist**
   - Created proxy route at `/dashboard/watchlist` that forwards to `/api/watchlist`
   - All HTTP methods (GET, POST, PUT, DELETE) now work correctly

2. **404 Error: POST /dashboard/analyze**
   - Created proxy route at `/dashboard/analyze` that forwards to `/api/mcp/analyze`
   - Maintains backward compatibility with existing frontend code

## Watchlist API Endpoints

### 1. Manage Watchlists

#### GET /api/watchlist

Get all watchlists for the current user.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "watchlist_123",
      "userId": "user_456",
      "name": "Tech Stocks",
      "symbols": ["AAPL", "MSFT", "GOOGL"],
      "isDefault": false,
      "createdAt": "2026-01-19T...",
      "updatedAt": "2026-01-19T..."
    }
  ],
  "limits": {
    "maxWatchlists": 5,
    "maxSymbolsPerWatchlist": 50,
    "current": 2
  }
}
```

**Tier Limits:**

- **Free**: 1 watchlist, 10 symbols per watchlist
- **Pro**: 5 watchlists, 50 symbols per watchlist
- **Max**: Unlimited watchlists, unlimited symbols

---

#### POST /api/watchlist

Create a new watchlist.

**Request:**

```json
{
  "name": "Tech Stocks",
  "symbols": ["AAPL", "MSFT", "GOOGL"],
  "isDefault": false
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "watchlist_123",
    "name": "Tech Stocks",
    "symbols": ["AAPL", "MSFT", "GOOGL"],
    "isDefault": false
  }
}
```

---

#### PUT /api/watchlist

Update an existing watchlist.

**Request:**

```json
{
  "id": "watchlist_123",
  "name": "Updated Tech Stocks",
  "symbols": ["AAPL", "MSFT", "GOOGL", "NVDA"],
  "isDefault": false
}
```

---

#### DELETE /api/watchlist?id=watchlist_123

Delete a watchlist.

---

### 2. Manage Symbols

#### POST /api/watchlist/symbols

Add a symbol to a watchlist.

**Request:**

```json
{
  "watchlistId": "watchlist_123",
  "symbol": "NVDA"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "watchlist_123",
    "symbols": ["AAPL", "MSFT", "GOOGL", "NVDA"]
  }
}
```

---

#### DELETE /api/watchlist/symbols?watchlistId=xxx&symbol=NVDA

Remove a symbol from a watchlist.

---

## Pro/Max Tier Features

### 3. Batch Analysis (Pro/Max Only)

#### POST /api/watchlist/analyze

Analyze all symbols in a watchlist at once.

**Request:**

```json
{
  "watchlistId": "watchlist_123",
  "period": "1mo"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "watchlistId": "watchlist_123",
    "watchlistName": "Tech Stocks",
    "results": [
      {
        "symbol": "AAPL",
        "success": true,
        "sentiment": "bullish",
        "signalCounts": {
          "total": 150,
          "bullish": 95,
          "bearish": 35,
          "neutral": 20
        },
        "price": 182.5,
        "priceChange": 2.34,
        "priceChangePercent": 1.3,
        "topSignals": [
          {
            "name": "RSI Oversold Recovery",
            "direction": "bullish",
            "strength": "strong"
          }
        ]
      }
    ],
    "summary": {
      "total": 4,
      "bullish": 3,
      "bearish": 0,
      "neutral": 1,
      "failed": 0
    },
    "tier": "pro"
  }
}
```

**Benefits for Pro/Max:**

- Analyze all watchlist symbols in parallel
- Get sentiment summary for entire watchlist
- Quickly identify which stocks are showing bullish/bearish signals
- Batch processing saves time vs individual analysis

---

### 4. Signals Summary (Pro/Max Only)

#### GET /api/watchlist/signals?watchlistId=xxx

Get the top trading opportunities from a watchlist.

**Response:**

```json
{
  "success": true,
  "data": {
    "watchlistId": "watchlist_123",
    "watchlistName": "Tech Stocks",
    "topOpportunities": [
      {
        "symbol": "NVDA",
        "sentiment": "bullish",
        "signalStrength": 42,
        "price": 495.23,
        "priceChange": 5.67,
        "priceChangePercent": 1.16,
        "topSignals": [
          {
            "name": "Golden Cross",
            "direction": "bullish",
            "strength": "strong"
          },
          {
            "name": "Volume Breakout",
            "direction": "bullish",
            "strength": "strong"
          }
        ],
        "totalSignals": 143
      }
    ],
    "bullishOpportunities": [...],
    "bearishOpportunities": [...],
    "summary": {
      "totalSymbols": 4,
      "analyzed": 4,
      "bullishCount": 3,
      "bearishCount": 1
    },
    "tier": "pro"
  }
}
```

**Benefits for Pro/Max:**

- Automatically identifies the best trading opportunities
- Ranked by signal strength (strongest signals first)
- Separate lists for bullish/bearish opportunities
- Shows top 3 signals for each symbol
- Perfect for daily market scanning routine

---

## Integration Between Watchlist & Analyze

### How Pro/Max Users Benefit

#### 1. **Workflow Integration**

```
Watchlist → Batch Analyze → Top Signals → Individual Deep Dive
```

Example workflow:

1. User creates watchlist with 20 tech stocks
2. Morning routine: Call `/api/watchlist/signals?watchlistId=xxx`
3. Review top 5 bullish opportunities
4. Deep dive on specific symbols using `/api/mcp/analyze`
5. Track positions with portfolio risk feature

#### 2. **Quick Symbol Addition**

From analyze page:

```javascript
// User analyzes AAPL and likes the signals
POST /api/watchlist/symbols
{
  "watchlistId": "my_watchlist",
  "symbol": "AAPL"
}
```

#### 3. **Automated Monitoring**

Pro/Max users can:

- Set up watchlists for different strategies (swing, day, scalp)
- Run batch analysis daily
- Get ranked opportunities without manual checking
- Export results for further analysis (Max tier)

#### 4. **Signal Correlation**

Max tier users get:

- Cross-watchlist analysis
- Sector concentration warnings
- Portfolio risk integration
- Signal correlation across positions

---

## Tier Comparison

| Feature                  | Free  | Pro    | Max       |
| ------------------------ | ----- | ------ | --------- |
| Watchlists               | 1     | 5      | Unlimited |
| Symbols per watchlist    | 10    | 50     | Unlimited |
| Individual analysis      | ✅    | ✅     | ✅        |
| Batch watchlist analysis | ❌    | ✅     | ✅        |
| Signals summary          | ❌    | ✅     | ✅        |
| Analysis limit           | 5/day | 50/day | Unlimited |
| Top signals shown        | 3     | 10     | All       |
| Portfolio risk           | ❌    | ✅     | ✅        |
| Cross-watchlist analysis | ❌    | ❌     | ✅        |

---

## Example Use Cases

### Use Case 1: Morning Routine (Pro/Max)

```javascript
// Get today's best opportunities
const response = await fetch(
  "/api/watchlist/signals?watchlistId=main_watchlist",
);
const { topOpportunities, bullishOpportunities } = await response.json();

// Show top 3 bullish setups
bullishOpportunities.slice(0, 3).forEach((stock) => {
  console.log(`${stock.symbol}: ${stock.signalStrength} strength`);
  console.log(stock.topSignals);
});
```

### Use Case 2: After-Market Analysis (Pro/Max)

```javascript
// Batch analyze all watchlist symbols
const response = await fetch("/api/watchlist/analyze", {
  method: "POST",
  body: JSON.stringify({
    watchlistId: "swing_trades",
    period: "1mo",
  }),
});

const { results, summary } = await response.json();
// summary shows: 15 bullish, 3 bearish, 2 neutral
```

### Use Case 3: Quick Add from Analysis (All Tiers)

```javascript
// User just analyzed NVDA and wants to track it
const response = await fetch("/api/watchlist/symbols", {
  method: "POST",
  body: JSON.stringify({
    watchlistId: "main_watchlist",
    symbol: "NVDA",
  }),
});
```

---

## Error Handling

### Tier Limit Errors (403)

```json
{
  "error": "Watchlist limit reached",
  "message": "Your pro tier allows 5 watchlists. Upgrade to add more.",
  "current": 5,
  "limit": 5
}
```

### Feature Access Errors (403)

```json
{
  "error": "Feature not available",
  "message": "Batch watchlist analysis is a Pro/Max feature. Upgrade to unlock.",
  "upgradeRequired": true,
  "requiredTier": "pro"
}
```

---

## Frontend Integration Examples

### React Component Example

```typescript
// Batch analyze watchlist (Pro/Max)
const analyzeBatchWatchlist = async (watchlistId: string) => {
  try {
    const response = await fetch("/api/watchlist/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ watchlistId, period: "1mo" }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.upgradeRequired) {
        // Show upgrade modal
        showUpgradeModal(data.requiredTier);
      }
      return;
    }

    // Display results
    displayBatchResults(data.data);
  } catch (error) {
    console.error("Batch analysis failed:", error);
  }
};

// Get top signals (Pro/Max)
const getTopSignals = async (watchlistId: string) => {
  const response = await fetch(
    `/api/watchlist/signals?watchlistId=${watchlistId}`,
  );
  const { data } = await response.json();
  return data.topOpportunities;
};
```

---

## Next Steps

### Recommended Frontend Components

1. **WatchlistManager** - CRUD operations for watchlists
2. **BatchAnalysisView** - Display batch analysis results
3. **SignalsOverview** - Show top opportunities from signals endpoint
4. **QuickAddButton** - Add current symbol to watchlist from analyze page
5. **UpgradePrompt** - Show when free users try Pro/Max features

### Backend Enhancements (Future)

1. Scheduled daily analysis for watchlists (Max tier)
2. Email alerts for top opportunities (Max tier)
3. Historical watchlist performance tracking
4. Signal backtesting for watchlist symbols
5. Multi-watchlist comparison (Max tier)

---

## Testing

Run these commands to test the endpoints:

```bash
# Get watchlists
curl http://localhost:3000/api/watchlist

# Create watchlist
curl -X POST http://localhost:3000/api/watchlist \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "symbols": ["AAPL"]}'

# Batch analyze (Pro/Max)
curl -X POST http://localhost:3000/api/watchlist/analyze \
  -H "Content-Type: application/json" \
  -d '{"watchlistId": "xxx", "period": "1mo"}'

# Get top signals (Pro/Max)
curl http://localhost:3000/api/watchlist/signals?watchlistId=xxx
```
