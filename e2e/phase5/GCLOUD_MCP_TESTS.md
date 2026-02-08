# GCloud MCP Results - Playwright Tests

## Overview

Tests all 9 MCP tools through the frontend, verifying **real GCloud MCP results** (NOT mock data or local yfinance).

## The 9 MCP Tools Tested

| #   | Tool                    | Description                     | Key Verification        |
| --- | ----------------------- | ------------------------------- | ----------------------- |
| 1   | `analyze_security`      | Deep analysis with 150+ signals | Price, signals, summary |
| 2   | `analyze_fibonacci`     | 40+ Fibonacci levels            | Levels, swing high/low  |
| 3   | `get_trade_plan`        | Risk-qualified trade plans      | Entry, stop, targets    |
| 4   | `compare_securities`    | Multi-stock comparison          | Comparison scores       |
| 5   | `screen_securities`     | Universe screening              | Match results           |
| 6   | `scan_trades`           | Find qualified setups           | Qualified trades        |
| 7   | `portfolio_risk`        | Aggregate risk analysis         | Total value, max loss   |
| 8   | `morning_brief`         | Daily market overview           | Market status           |
| 9   | `options_risk_analysis` | Options chain analysis          | Expiration, IV          |

## Running the Tests

### Prerequisites

1. **GCloud MCP Server** must be running:

   ```bash
   # Check if MCP server is available
   curl https://your-mcp-server.run.app/health
   ```

2. **Frontend** running at localhost:3000:
   ```bash
   cd nextjs-mcp-finance
   npm run dev
   ```

### Run All GCloud MCP Tests

```bash
# From nextjs-mcp-finance directory
npx playwright test e2e/phase5/gcloud-mcp-results.spec.ts
```

### Run Specific Tool Test

```bash
# Test only analyze_security
npx playwright test -g "Analyze Security"

# Test only Fibonacci
npx playwright test -g "Fibonacci Analysis"

# Test only Trade Plan
npx playwright test -g "Trade Plan"
```

### Run API Direct Tests Only

```bash
npx playwright test -g "API Direct"
```

### Run with UI Mode (Visual)

```bash
npx playwright test e2e/phase5/gcloud-mcp-results.spec.ts --ui
```

### Run in Headed Mode (See Browser)

```bash
npx playwright test e2e/phase5/gcloud-mcp-results.spec.ts --headed
```

## Test Output

Each test logs:

- Tool name
- PASS/FAIL status
- Execution time in milliseconds

Example output:

```
Analyze Security: PASS (3245ms)
Fibonacci Analysis: PASS (2891ms)
Trade Plan: PASS (4102ms)
...
```

## What Tests Verify

### Real Data Checks

- Prices are real numbers (e.g., `$182.45`)
- No mock indicators (`mock`, `placeholder`, `hardcoded`)
- Execution times are realistic (500ms - 45s)

### Result Structure

- Symbol is returned
- Price data exists
- Tool-specific fields present

### Error Handling

- Missing parameters show errors
- Invalid tools handled gracefully
- User-friendly error messages

## Test Categories

### 1. Individual Tool Tests (9 tests)

Each tool is tested independently with appropriate parameters.

### 2. Integration Tests (4 tests)

- Execution time under 45 seconds
- Real data (no mocks)
- Execution time recorded
- Error handling works

### 3. API Direct Tests (4 tests)

Direct API calls to `/api/gcloud/execute`:

- `analyze_security` works
- `analyze_fibonacci` works
- Invalid tool handling
- Missing parameters handling

## Troubleshooting

### Test Fails with 401/403

- User not authenticated
- Need to set up test user auth

### Test Fails with 503

- GCloud MCP server is down
- Check server health endpoint

### Test Times Out

- Increase timeout: `test.setTimeout(90000)`
- Check network connectivity

### No Results Displayed

- Check browser console for errors
- Verify MCP client configuration
- Check `/api/gcloud/execute` endpoint

## Configuration

Tests use `playwright.config.ts`:

- Base URL: `http://localhost:3000`
- Timeout: 60 seconds per test
- Retries: 2 on CI

## Environment Variables

For authenticated testing:

```env
# .env.test
TEST_BASE_URL=http://localhost:3000
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=testpass123
```

## Quick Test Command Reference

```bash
# Run all phase5 tests
npx playwright test e2e/phase5/

# Run only GCloud MCP tests
npx playwright test gcloud-mcp-results

# Run with verbose output
npx playwright test gcloud-mcp-results --reporter=list

# Generate HTML report
npx playwright test gcloud-mcp-results --reporter=html
npx playwright show-report
```
