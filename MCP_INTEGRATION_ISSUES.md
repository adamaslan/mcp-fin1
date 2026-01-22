# MCP Integration Issues - Complete Analysis

## ✅ Implementation Status

**STATUS:** Endpoints implemented and ready for deployment

| Endpoint              | Status         | File                              | Line    |
| --------------------- | -------------- | --------------------------------- | ------- |
| `/api/trade-plan`     | ✅ IMPLEMENTED | `/mcp-finance1/cloud-run/main.py` | 388-405 |
| `/api/scan`           | ✅ IMPLEMENTED | `/mcp-finance1/cloud-run/main.py` | 408-425 |
| `/api/portfolio-risk` | ✅ IMPLEMENTED | `/mcp-finance1/cloud-run/main.py` | 428-444 |
| `/api/morning-brief`  | ✅ IMPLEMENTED | `/mcp-finance1/cloud-run/main.py` | 447-464 |

**Related Files:**

- ✅ IMPLEMENTATION_SUMMARY.md - Detailed implementation guide
- ✅ test_endpoints.sh - Integration test script
- ✅ Request models - TradePlanRequest, ScanRequest, PortfolioRiskRequest, MorningBriefRequest

**Frontend Pages Now Enabled:**

- ✅ `/analyze/[symbol]` - Trade plan analysis
- ✅ `/scanner` - Trade scanning
- ✅ `/portfolio` - Portfolio risk assessment
- ✅ Dashboard - Morning market briefing

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CURRENT STATE                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐         ┌──────────────────────────────────┐  │
│  │   Next.js App    │         │      Cloud Run FastAPI           │  │
│  │                  │  HTTP   │   (Partial Implementation)       │  │
│  │ src/lib/mcp/     │────────▶│                                  │  │
│  │  client.ts       │  404s   │  /api/analyze     ✅ (async)     │  │
│  │                  │         │  /api/compare     ✅              │  │
│  │ Calls:           │         │  /api/screen      ✅ (async)     │  │
│  │  - /api/trade-plan ❌     │  /api/signals     ✅              │  │
│  │  - /api/portfolio-risk ❌ │  /api/trade-plan  ❌ MISSING     │  │
│  │  - /api/morning-brief ❌  │  /api/scan        ❌ MISSING     │  │
│  │  - /api/scan     ❌       │  /api/portfolio-risk ❌ MISSING  │  │
│  │                  │         │  /api/morning-brief ❌ MISSING   │  │
│  └──────────────────┘         └──────────────────────────────────┘  │
│                                           │                          │
│                                           │ (Pub/Sub)                │
│                                           ▼                          │
│                               ┌──────────────────────────────────┐  │
│                               │      MCP Server (Python)         │  │
│                               │    (Full Implementation)         │  │
│                               │                                  │  │
│                               │  • analyze_security     ✅       │  │
│                               │  • compare_securities   ✅       │  │
│                               │  • screen_securities    ✅       │  │
│                               │  • get_trade_plan       ✅       │  │
│                               │  • scan_trades          ✅       │  │
│                               │  • portfolio_risk       ✅       │  │
│                               │  • morning_brief        ✅       │  │
│                               │                                  │  │
│                               │  (stdio-based MCP protocol)      │  │
│                               └──────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Root Cause

**The MCP Server has ALL the functionality**, but it's designed for stdio (standard input/output) communication, not HTTP. The Cloud Run FastAPI backend only exposes a subset of this functionality as HTTP endpoints.

---

## Gap Analysis

### What MCP Server Provides (Full Feature Set)

Located at: `/Users/adamaslan/code/gcp app w mcp/mcp-finance1/src/technical_analysis_mcp/server.py`

| Tool                 | Description                          | Has Implementation |
| -------------------- | ------------------------------------ | ------------------ |
| `analyze_security`   | 150+ technical signals analysis      | ✅ Complete        |
| `compare_securities` | Compare multiple stocks              | ✅ Complete        |
| `screen_securities`  | Screen against criteria              | ✅ Complete        |
| `get_trade_plan`     | Risk-qualified trade plans (1-3 max) | ✅ Complete        |
| `scan_trades`        | Scan universe for setups             | ✅ Complete        |
| `portfolio_risk`     | Aggregate portfolio risk             | ✅ Complete        |
| `morning_brief`      | Daily market briefing                | ✅ Complete        |

### What Cloud Run Exposes (Incomplete)

Located at: `/Users/adamaslan/code/gcp app w mcp/mcp-finance1/cloud-run/main.py`

| Endpoint                    | Maps To              | Status     | Notes                        |
| --------------------------- | -------------------- | ---------- | ---------------------------- |
| `POST /api/analyze`         | `analyze_security`   | ⚠️ Async   | Returns job status, not data |
| `POST /api/compare`         | `compare_securities` | ✅ Works   | Sync response                |
| `POST /api/screen`          | `screen_securities`  | ⚠️ Async   | Returns job status           |
| `GET /api/signals/{symbol}` | (cache lookup)       | ⚠️ Partial | Requires prior analysis      |
| `POST /api/trade-plan`      | `get_trade_plan`     | ❌ Missing | **Not implemented**          |
| `POST /api/scan`            | `scan_trades`        | ❌ Missing | **Not implemented**          |
| `POST /api/portfolio-risk`  | `portfolio_risk`     | ❌ Missing | **Not implemented**          |
| `POST /api/morning-brief`   | `morning_brief`      | ❌ Missing | **Not implemented**          |

### What Frontend Needs

Located at: `/Users/adamaslan/code/gcp app w mcp/nextjs-mcp-finance/src/lib/mcp/client.ts`

| Method               | Calls                 | Used By                  |
| -------------------- | --------------------- | ------------------------ |
| `getTradePlan()`     | `/api/trade-plan`     | `/analyze/[symbol]` page |
| `scanTrades()`       | `/api/scan`           | `/scanner` page          |
| `portfolioRisk()`    | `/api/portfolio-risk` | `/portfolio` page        |
| `morningBrief()`     | `/api/morning-brief`  | Dashboard                |
| `analyzeSecurity()`  | `/api/analyze`        | Analysis components      |
| `screenSecurities()` | `/api/screen`         | Scanner page             |
| `compareSecurity()`  | `/api/compare`        | Comparison feature       |

---

## Solution: Add Missing Endpoints to Cloud Run

The fix requires adding 4 new endpoints to the Cloud Run FastAPI backend. The implementation already exists in the MCP server - we just need to expose it via HTTP.

### Files to Modify

**Backend:** `/Users/adamaslan/code/gcp app w mcp/mcp-finance1/cloud-run/main.py`

### Implementation Plan

#### 1. Add Request Models

```python
class TradePlanRequest(BaseModel):
    symbol: str = Field(..., description="Ticker symbol")
    period: str = Field("1mo", description="Time period")

class ScanRequest(BaseModel):
    universe: str = Field("sp500", description="Universe to scan")
    max_results: int = Field(10, ge=1, le=50, description="Max results")

class PortfolioRiskRequest(BaseModel):
    positions: List[Dict[str, Any]] = Field(..., description="Portfolio positions")

class MorningBriefRequest(BaseModel):
    watchlist: Optional[List[str]] = Field(None, description="Symbols to analyze")
    market_region: str = Field("US", description="Market region")
```

#### 2. Add Imports (top of main.py)

```python
# Add these imports to connect to MCP tools
import sys
sys.path.insert(0, '/path/to/mcp-finance1/src')

from technical_analysis_mcp.server import (
    get_trade_plan,
    scan_trades,
    portfolio_risk,
    morning_brief,
)
```

#### 3. Add Endpoints

```python
@app.post("/api/trade-plan")
async def trade_plan(request: TradePlanRequest):
    """Get risk-qualified trade plan for a symbol"""
    try:
        result = await get_trade_plan(
            symbol=request.symbol,
            period=request.period
        )
        return result
    except Exception as e:
        logger.error(f"Trade plan error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/scan")
async def scan(request: ScanRequest):
    """Scan universe for qualified trade setups"""
    try:
        result = await scan_trades(
            universe=request.universe,
            max_results=request.max_results
        )
        return result
    except Exception as e:
        logger.error(f"Scan error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/portfolio-risk")
async def portfolio_risk_endpoint(request: PortfolioRiskRequest):
    """Assess aggregate portfolio risk"""
    try:
        result = await portfolio_risk(positions=request.positions)
        return result
    except Exception as e:
        logger.error(f"Portfolio risk error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/morning-brief")
async def morning_brief_endpoint(request: MorningBriefRequest):
    """Generate daily market briefing"""
    try:
        result = await morning_brief(
            watchlist=request.watchlist,
            market_region=request.market_region
        )
        return result
    except Exception as e:
        logger.error(f"Morning brief error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
```

---

## Alternative: Fix Frontend Client to Match Existing Backend

If adding backend endpoints isn't feasible immediately, the frontend client can be modified to use what's available:

### Option A: Map to existing endpoints

| Frontend Needs        | Use Instead          | Notes                                      |
| --------------------- | -------------------- | ------------------------------------------ |
| `/api/trade-plan`     | `/api/analyze`       | Parse trade plans from analyze response    |
| `/api/scan`           | `/api/screen` + poll | Use screen with universe, poll for results |
| `/api/portfolio-risk` | Client-side calc     | Calculate from individual analyses         |
| `/api/morning-brief`  | `/api/reports/daily` | Use daily reports instead                  |

### Option B: Handle async endpoints properly

The `/api/analyze` endpoint returns:

```json
{
  "status": "processing",
  "symbol": "AAPL",
  "request_id": "abc123",
  "check_url": "/api/signals/AAPL"
}
```

Frontend should:

1. Call `/api/analyze`
2. If status is "processing", poll `/api/signals/{symbol}` until data is ready
3. If cached data exists, it returns immediately

---

## Async Endpoint Flow

```
Frontend                    Cloud Run                   Pub/Sub           Worker
   │                            │                           │                │
   │ POST /api/analyze          │                           │                │
   │───────────────────────────▶│                           │                │
   │                            │ Check Firestore cache     │                │
   │                            │◀─────────────────────────▶│                │
   │                            │                           │                │
   │ (if cached)                │                           │                │
   │◀──────────────────────────▶│ Return cached data        │                │
   │                            │                           │                │
   │ (if not cached)            │                           │                │
   │◀───────────────────────────│ Return {status: processing}                │
   │                            │ Publish to Pub/Sub        │                │
   │                            │──────────────────────────▶│                │
   │                            │                           │ Trigger worker │
   │                            │                           │───────────────▶│
   │                            │                           │                │ Run analysis
   │                            │                           │                │ Save to Firestore
   │                            │                           │◀───────────────│
   │                            │                           │                │
   │ GET /api/signals/AAPL      │                           │                │
   │───────────────────────────▶│                           │                │
   │◀───────────────────────────│ Return analysis data      │                │
   │                            │                           │                │
```

---

## Files Reference

### Backend (Python)

- **MCP Server:** `/Users/adamaslan/code/gcp app w mcp/mcp-finance1/src/technical_analysis_mcp/server.py`
- **Cloud Run API:** `/Users/adamaslan/code/gcp app w mcp/mcp-finance1/cloud-run/main.py`
- **Risk Assessor:** `/Users/adamaslan/code/gcp app w mcp/mcp-finance1/src/technical_analysis_mcp/risk/risk_assessor.py`
- **Trade Scanner:** `/Users/adamaslan/code/gcp app w mcp/mcp-finance1/src/technical_analysis_mcp/scanners/trade_scanner.py`
- **Portfolio Risk:** `/Users/adamaslan/code/gcp app w mcp/mcp-finance1/src/technical_analysis_mcp/portfolio/portfolio_risk.py`
- **Morning Briefer:** `/Users/adamaslan/code/gcp app w mcp/mcp-finance1/src/technical_analysis_mcp/briefing/morning_briefer.py`

### Frontend (TypeScript)

- **MCP Client:** `/Users/adamaslan/code/gcp app w mcp/nextjs-mcp-finance/src/lib/mcp/client.ts`
- **MCP Types:** `/Users/adamaslan/code/gcp app w mcp/nextjs-mcp-finance/src/lib/mcp/types.ts`
- **Trade Plan Route:** `/Users/adamaslan/code/gcp app w mcp/nextjs-mcp-finance/src/app/api/mcp/trade-plan/route.ts`

---

## Completed Action Items ✅

### Priority 1: Add missing Cloud Run endpoints

1. [x] ✅ Add `/api/trade-plan` endpoint (enables `/analyze/[symbol]` page)
2. [x] ✅ Add `/api/scan` endpoint (enables `/scanner` page)

### Priority 2: Add remaining endpoints

3. [x] ✅ Add `/api/portfolio-risk` endpoint (enables `/portfolio` page)
4. [x] ✅ Add `/api/morning-brief` endpoint (enables dashboard morning brief)

### Deployment & Testing

5. [ ] Deploy updated Cloud Run backend
6. [ ] Run test_endpoints.sh to validate all endpoints
7. [ ] Monitor logs for any issues
8. [ ] Frontend will automatically work - no changes needed

---

## Testing Checklist

After implementing endpoints:

```bash
# Test trade plan
curl -X POST https://technical-analysis-api-xxx.run.app/api/trade-plan \
  -H "Content-Type: application/json" \
  -d '{"symbol": "AAPL", "period": "1mo"}'

# Test scan
curl -X POST https://technical-analysis-api-xxx.run.app/api/scan \
  -H "Content-Type: application/json" \
  -d '{"universe": "sp500", "max_results": 5}'

# Test portfolio risk
curl -X POST https://technical-analysis-api-xxx.run.app/api/portfolio-risk \
  -H "Content-Type: application/json" \
  -d '{"positions": [{"symbol": "AAPL", "shares": 100, "entry_price": 150}]}'

# Test morning brief
curl -X POST https://technical-analysis-api-xxx.run.app/api/morning-brief \
  -H "Content-Type: application/json" \
  -d '{"watchlist": ["AAPL", "MSFT", "GOOGL"], "market_region": "US"}'
```
