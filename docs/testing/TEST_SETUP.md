# Test Setup and Configuration

This document provides setup instructions and configuration details for the comprehensive testing strategy implemented in MCP Finance.

## Quick Start

### Install Dependencies

```bash
npm install
npx playwright install --with-deps
```

### Run Tests

```bash
# Run all tests
npm run test:all

# Run specific test suites
npm run test:structure          # Layer 1: File structure validation
npm run test:build             # Layer 2: Build validation tests
npm run test:unit              # Layer 3: Component unit tests
npm run test:e2e               # Layer 4: E2E integration tests
npm run test:e2e:smoke         # Layer 5: Production smoke tests

# E2E subsets
npm run test:e2e:pages         # Landing, pricing, auth pages
npm run test:e2e:dashboard     # Dashboard pages only
npm run test:e2e:ui            # Interactive UI mode
npm run test:e2e:headed        # Run with visible browser
npm run test:e2e:debug         # Debug mode with inspector

# Validation scripts
npm run validate:imports       # Check all @/ imports resolve
npm run precommit              # Run pre-commit checks
```

## Test Structure

### Layer 1: Structure Validation

**Location:** `tests/structure/`
**Speed:** < 30 seconds

Tests that validate file system and project structure:

- `routes.test.ts` - Validates Next.js routes have correct syntax
- `naming.test.ts` - Ensures consistent file naming conventions

### Layer 2: Static Analysis & Build

**Location:** `tests/build/`, `tests/imports/`, `scripts/`
**Speed:** 1-2 minutes

Tests that catch import errors and build failures:

- `validate-imports.ts` - CLI script to validate all `@/` alias imports
- `ui-components.test.ts` - Ensures all imported UI components exist
- `typescript.test.ts` - Runs TypeScript compilation check
- `nextjs.test.ts` - Validates Next.js build succeeds

### Layer 3: Component Unit Tests

**Location:** `tests/components/`
**Speed:** 2-5 minutes

Tests for individual React components:

- `ui/button.test.tsx` - Example component test using Vitest
- Additional tests for each UI component

**Running:**

```bash
npm run test:unit
```

### Layer 4: E2E Integration Tests

**Location:** `e2e/`
**Speed:** 15-30 minutes

Tests for complete user workflows using Playwright:

#### Structure Tests

- `structure/all-routes.spec.ts` - Verifies all static routes load without errors
- `routes/dynamic-routes.spec.ts` - Tests dynamic routes like `/analyze/[symbol]`

#### Page Tests

- `pages/landing.spec.ts` - Landing page hero, market pulse, pricing
- `pages/pricing.spec.ts` - Pricing page with all tiers
- `pages/auth.spec.ts` - Sign-in/Sign-up pages

#### Dashboard Tests (Authenticated)

- `dashboard/main.spec.ts` - Main dashboard with market snapshot
- `dashboard/analyze.spec.ts` - Stock analysis page
- `dashboard/scanner.spec.ts` - Trade scanner with results
- `dashboard/watchlist.spec.ts` - Watchlist management
- `dashboard/portfolio.spec.ts` - Portfolio view
- `dashboard/morning-brief.spec.ts` - Morning brief
- `dashboard/alerts.spec.ts` - Alert management
- `dashboard/calendar.spec.ts` - Event calendar
- `dashboard/compare.spec.ts` - Stock comparison
- `dashboard/export.spec.ts` - Data export
- `dashboard/fibonacci.spec.ts` - Fibonacci calculator
- `dashboard/journal.spec.ts` - Trading journal
- `dashboard/learn.spec.ts` - Learning resources (indicators, signals)
- `dashboard/news.spec.ts` - News page
- `dashboard/options.spec.ts` - Options tools
- `dashboard/signals.spec.ts` - Trading signals
- `dashboard/settings.spec.ts` - User settings
- `dashboard/navigation.spec.ts` - Navigation between all routes

#### Production Tests

- `production/extended-smoke.spec.ts` - Production health checks

### Layer 5: Production Smoke Tests

**Location:** `e2e/production/`
**Speed:** < 5 minutes

Tests for deployed production environment:

- `extended-smoke.spec.ts` - Checks critical pages load without errors

## Configuration Files

### vitest.config.ts

Configuration for Vitest (unit tests):

```typescript
- Environment: jsdom (for React component testing)
- Globals: true (describe, it, expect available globally)
- Setup files: tests/setup.ts
- Path alias: @ → src
```

### playwright.config.ts

Configuration for Playwright (E2E tests):

```typescript
- Base URL: http://localhost:3000 (local) or TEST_BASE_URL env var
- Browsers: Chromium, Firefox, WebKit + Mobile Chrome
- Screenshots: Only on failure
- Videos: Retained on failure
- Retries: 2 in CI, 0 locally
- Timeout: 30 seconds per test
```

### tests/setup.ts

Setup file for Vitest:

- Cleanup after each test
- Mock Next.js router and navigation
- Mock Clerk authentication
- Suppress console errors for known issues

## Environment Variables

Create `.env.test` for test configuration:

```bash
# Test database (if needed)
DATABASE_URL=postgresql://test:test@localhost:5432/test_mcp_finance

# Test user credentials
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=password123

# Base URLs
TEST_BASE_URL=http://localhost:3000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx

# Clerk test keys
CLERK_SECRET_KEY=sk_test_xxx
```

## Authentication in E2E Tests

The `e2e/fixtures/authenticated-user.ts` provides:

### Usage

```typescript
import { test, expect } from "../fixtures/authenticated-user";

test("authenticated test", async ({ authenticatedPage }) => {
  // authenticatedPage is automatically logged in
  await authenticatedPage.goto("/dashboard");
  await expect(authenticatedPage.locator("text=/welcome/i")).toBeVisible();
});
```

### How It Works

1. Uses `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` environment variables
2. Logs in before running the test
3. Provides `authenticatedPage` fixture with active session
4. Also provides `tierHelper` for testing tier-gated features

## Utilities

### Console Error Collector

**Location:** `e2e/utils/console-collector.ts`

Captures console errors and warnings during E2E tests:

```typescript
import { collectConsoleErrors } from "../utils/console-collector";

const errors = await collectConsoleErrors(page, async () => {
  await page.goto("/page");
  await page.waitForLoadState("networkidle");
});
```

## CI/CD Integration

### GitHub Actions

**Location:** `.github/workflows/test.yml`

Runs all test layers sequentially:

1. Structure validation (fails fast if issues found)
2. Build validation
3. Unit tests
4. E2E tests
5. Production smoke tests (only on main branch)

Each layer depends on previous layer passing.

### Pre-commit Hooks

**Location:** `.husky/pre-commit`

Runs fast validation before committing:

- ESLint
- Import validation
- Structure tests

Cannot be bypassed without `--no-verify`.

## Common Test Patterns

### Testing Unauthenticated Pages

```typescript
test("landing page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
});
```

### Testing Authenticated Pages

```typescript
test("dashboard loads", async ({ authenticatedPage }) => {
  await authenticatedPage.goto("/dashboard");
  await expect(authenticatedPage.locator("text=/welcome/i")).toBeVisible();
});
```

### Testing Dynamic Routes

```typescript
test("analyze page for symbol", async ({ authenticatedPage }) => {
  await authenticatedPage.goto("/analyze/AAPL");
  await expect(authenticatedPage.locator("text=/AAPL/i")).toBeVisible();
});
```

### Testing with Console Error Collection

```typescript
test("page has no console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });

  await page.goto("/page");
  expect(errors).toHaveLength(0);
});
```

### Testing Async Operations

```typescript
test("scan results load", async ({ authenticatedPage }) => {
  await authenticatedPage.goto("/scanner");
  await authenticatedPage.locator("button:has-text('Scan')").click();

  // Wait for spinner to disappear
  await authenticatedPage
    .waitForSelector('[class*="animate-spin"]', {
      state: "detached",
      timeout: 30000,
    })
    .catch(() => {});

  // Results should be visible
  await expect(
    authenticatedPage.locator("text=/results|no.*found/i").first(),
  ).toBeVisible({ timeout: 30000 });
});
```

## Debugging Tests

### Run Tests in UI Mode

```bash
npm run test:e2e:ui
```

Opens interactive test runner with timeline and code inspector.

### Run with Visible Browser

```bash
npm run test:e2e:headed
```

Runs tests with browser window visible.

### Debug Mode

```bash
npm run test:e2e:debug
```

Opens Playwright Inspector - step through tests interactively.

### View Test Report

```bash
npm run test:e2e:report
```

Opens HTML report of last test run with screenshots/videos.

## Best Practices

1. **Write tests at the appropriate layer**
   - Is it a structure issue? → Layer 1
   - Is it a build/compile issue? → Layer 2
   - Is it a component logic issue? → Layer 3
   - Is it a user workflow issue? → Layer 4

2. **Keep tests focused**
   - One assertion per test when possible
   - Use descriptive test names
   - Test the happy path in main test
   - Test error cases separately

3. **Use fixtures and page objects**
   - `authenticatedPage` for logged-in tests
   - Extract common patterns into utilities
   - Reuse locators across related tests

4. **Wait for async operations**
   - `waitForLoadState("networkidle")` for API calls
   - `waitForSelector(..., { state: "detached" })` for loading spinners
   - `isVisible({ timeout: 15000 })` for async content

5. **Handle dynamic content**
   - Use regex patterns for text matching: `text=/pattern/i`
   - Check for multiple possible states (has content OR upgrade prompt)
   - Don't assume specific DOM structure

## Troubleshooting

### Tests fail locally but pass in CI

- Check `.env.test` is correctly configured
- Ensure test server is running: `npm run dev`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Playwright tests timeout

- Increase timeout: `test(..., { timeout: 60000 })`
- Check if server is running
- Verify network is not blocked
- Check for missing test data

### Unit tests fail to compile

- Run `npm run validate:imports` to check import paths
- Run `npx tsc --noEmit` to check types
- Verify mock setup in `tests/setup.ts`

### Console errors in tests

- Filter known benign errors in `tests/setup.ts`
- Use `page.on("console", msg => { ... })` to capture specific errors
- Check browser console in headed mode: `npm run test:e2e:headed`

## Next Steps

- Add more component unit tests in `tests/components/`
- Create API endpoint tests in `e2e/api/` directory
- Set up test database seeding for consistent test data
- Configure test user account management
- Set up visual regression testing for critical pages
