# Industry Tracker Integration Setup

## Overview

The landing page now displays a live table of the top 50 industries by performance using data from the GCloud industry tracker.

**Data Source:** GCloud Python MCP backend → Industry Tracker service → Multiple APIs (Finnhub, Alpha Vantage, yfinance with fallback)

## Setup Required

### 1. Environment Variables

Add these to your `.env.local`:

```bash
# GCloud Industry Tracker Backend
MCP_BACKEND_URL=http://localhost:5000
MCP_BACKEND_TOKEN=your_backend_token_here

# GCP Configuration (if using cloud deployment)
GCP_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
```

### 2. Backend Service

The Next.js app expects a Python backend service running on `http://localhost:5000` with:

- **Endpoint:** `POST /industry-tracker/top`
- **Request body:**
  ```json
  {
    "horizon": "1w",
    "top_n": 50
  }
  ```
- **Response:**
  ```json
  {
    "data": {
      "top_performers": [
        {
          "industry": "Mining",
          "etf": "XME",
          "returns": { "1w": 3.67, "2w": 2.5, "1m": 5.2 },
          "rank": 1
        }
      ]
    }
  }
  ```

### 3. Running the Backend

From the MCP Finance directory:

```bash
# Activate the fin-ai1 environment
mamba activate fin-ai1

# Start the industry tracker backend
# (This depends on your backend implementation)
python -m your_backend_module
```

## Component Features

### Time Horizons

The table supports switching between:
- **1w** - Last week (5 trading days)
- **2w** - Last 2 weeks (10 trading days)
- **1m** - Last month (21 trading days)

### Data Display

Each row shows:
1. **Rank** - Position in performance ranking
2. **Industry** - Industry name (e.g., "Mining")
3. **ETF** - Representative ETF ticker (e.g., "XME")
4. **Return** - Performance percentage with color coding:
   - 🟢 Green for positive returns
   - 🔴 Red for negative returns
   - Gray for neutral (0%)

### Error Handling

- **No data:** Shows "No data available" message
- **API error:** Displays error message with details (in development)
- **Loading:** Shows spinner while fetching

## File Locations

- **Component:** `/src/components/landing/IndustryPerformers.tsx`
- **API Route:** `/src/app/api/mcp/industry-tracker/route.ts`
- **Landing Page:** `/src/app/page.tsx`

## API Endpoint Details

### POST `/api/mcp/industry-tracker`

**Request:**
```json
{
  "horizon": "1w",
  "top_n": 50
}
```

**Parameters:**
- `horizon` (required): One of `1w`, `2w`, `1m`, `2m`, `3m`, `6m`, `52w`, `2y`, `3y`, `5y`, `10y`
- `top_n` (optional): Number of results to return (default: 50)

**Response (Success - 200):**
```json
{
  "success": true,
  "horizon": "1w",
  "top_n": 50,
  "data": {
    "top_performers": [...],
    "worst_performers": [...],
    "metrics": {
      "average_return": 1.23,
      "positive_count": 38,
      "negative_count": 9
    }
  },
  "timestamp": "2026-02-24T13:20:45.123Z"
}
```

**Response (Error):**
- `400`: Invalid horizon
- `503`: Backend service unavailable
- `500`: Server error

## Testing

### Local Development

1. Start the backend service on `localhost:5000`
2. Run the Next.js dev server: `npm run dev`
3. Visit `http://localhost:3000`
4. Scroll down to "Industry Performance" section
5. Switch between time horizons to see data updates

### With Mock Data (Development)

If backend is unavailable, the component will:
- Show error message
- Allow you to debug the API connection
- Display "No data available" state

## Performance

- **Initial load:** 2-3 seconds (fetches from GCloud)
- **Subsequent horizon switches:** <500ms (client-side table filtering)
- **Auto-refresh:** None (manual per horizon switch)

## Future Enhancements

- [ ] Auto-refresh on interval
- [ ] Search/filter functionality
- [ ] Sort by column
- [ ] Export to CSV
- [ ] Show additional metrics (volatility, volume, etc.)
- [ ] Historical performance graph
- [ ] Comparison between horizons

## Troubleshooting

### "Failed to fetch data" / 503 Error

**Problem:** Backend service not running or not responding
**Solution:**
1. Check `MCP_BACKEND_URL` is correct
2. Ensure Python backend is running on that port
3. Check backend logs for errors
4. Verify GCP credentials are set if using cloud deployment

### "Invalid response format" Error

**Problem:** Backend returning unexpected data structure
**Solution:**
1. Verify backend returns the expected JSON structure
2. Check backend service is the correct version
3. Review API logs in browser DevTools (Network tab)

### No industries showing (Empty table)

**Problem:** Could mean:
- All data loaded but no performers for selected horizon
- API returned empty results
- Data not available in GCloud

**Solution:**
1. Check browser console for errors
2. Verify GCloud credentials
3. Try different time horizon
4. Check GCloud industry tracker is running

## Architecture

```
Frontend (Next.js)
    ↓
IndustryPerformers Component
    ↓
/api/mcp/industry-tracker endpoint
    ↓
MCP Backend (Python) - http://localhost:5000
    ↓
Industry Tracker Service
    ↓
GCloud APIs (Finnhub → Alpha Vantage → yfinance)
    ↓
Real-time Market Data
```

## Related Documentation

- **Industry Tracker Module:** `/9_mcp/morning_brief/industry_tracker/SETUP.md`
- **Landing Page Components:** `/src/components/landing/`
- **MCP Integration:** `/src/lib/mcp/`
