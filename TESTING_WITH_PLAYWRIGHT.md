# Testing with Playwright - Complete Guide

Complete guide for E2E testing the MCP Finance dashboard in production and development environments. Covers setup, running tests, writing new tests, Playwright vs Cypress comparison, and cloud testing integration.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Installation & Setup](#installation--setup)
3. [Running Tests](#running-tests)
4. [Writing New Tests](#writing-new-tests)
5. [Authentication & Fixtures](#authentication--fixtures)
6. [Page Object Models](#page-object-models)
7. [API Testing](#api-testing)
8. [Production Testing](#production-testing)
9. [Debugging](#debugging)
10. [Playwright vs Cypress](#playwright-vs-cypress)
11. [Cloud Testing Services](#cloud-testing-services)
12. [CI/CD Integration](#cicd-integration)
13. [Troubleshooting](#troubleshooting)
14. [Best Practices](#best-practices)

---

## Quick Start

### 5-Minute Setup

```bash
# 1. Copy environment template
cp .env.test.example .env.test

# 2. Edit .env.test with your Clerk test user credentials
nano .env.test
# TEST_USER_EMAIL=your-test-user@example.com
# TEST_USER_PASSWORD=YourSecurePassword123!

# 3. Create test user in Clerk Dashboard
# - Go to Clerk Dashboard → Users → Create User
# - Set email and password
# - Edit public metadata: { "tier": "free" }

# 4. Run authentication setup (first time only)
npm run test:e2e:auth

# 5. Run all tests
npm run test:e2e

# 6. View results
npm run test:e2e:report
```

---

## Installation & Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Clerk test account
- ~2 GB disk space for browser downloads

### Step 1: Install Dependencies

Playwright is already installed as a dev dependency:

```bash
npm install
```

Browser binaries are downloaded during first run, or manually:

```bash
npx playwright install
```

### Step 2: Set Up Environment

```bash
# Copy template
cp .env.test.example .env.test

# Edit with your credentials
# Required:
# - TEST_USER_EMAIL
# - TEST_USER_PASSWORD
# - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
```

### Step 3: Create Test User in Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to Users → Create User
3. Enter test email and password
4. Click on the user → Edit public metadata
5. Set: `{ "tier": "free" }`
6. Save

### Step 4: First Authentication Run

```bash
# This signs in and saves session to .auth/user.json
npx playwright test e2e/auth/signin.spec.ts --headed

# You should see browser open, sign in happen, then close
# Verify .auth/user.json was created:
ls -la .auth/user.json
```

### Step 5: Verify Setup

```bash
npx playwright test --list
```

Should show test structure like:

```
  e2e/auth/signin.spec.ts
    ✓ User can sign in with valid credentials
    ✓ Session persists across page reloads
  e2e/features/analyze-free.spec.ts
    ✓ Free users see only swing timeframe
    ...
```

---

## Running Tests

### Basic Commands

```bash
# Run all tests (all browsers, all tests)
npm run test:e2e

# Run with interactive UI (can run/debug individually)
npm run test:e2e:ui

# Run in headed mode (see browser window)
npm run test:e2e:headed

# Run in debug mode (step through)
npm run test:e2e:debug

# Show HTML report
npm run test:e2e:report
```

### Run Specific Test Subsets

```bash
# Authentication tests
npm run test:e2e:auth

# Free tier features only
npm run test:e2e:free

# API endpoint tests
npm run test:e2e:api

# Production smoke tests
npm run test:e2e:production

# Single test file
npx playwright test e2e/features/analyze-free.spec.ts

# Tests matching pattern
npx playwright test -g "timeframe"

# Single browser
npx playwright test --project=chromium

# Single browser, single file
npx playwright test e2e/auth/signin.spec.ts --project=firefox
```

### View Results

```bash
# Open HTML report (shows all test results, traces, videos)
npm run test:e2e:report

# Show trace for specific failed test
npx playwright show-trace playwright-report/trace.zip
```

### Common Patterns

```bash
# Quick smoke test before commit
npm run test:e2e:free

# Full test suite
npm run test:e2e

# Develop a single test
npx playwright test e2e/features/analyze-free.spec.ts --debug

# Test in production
npm run test:e2e:production
```

---

## Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from "../../e2e-utils/fixtures/free-tier-user";
import { AnalyzePage } from "../../e2e-utils/pages/analyze-page";

test.describe("Feature Name", () => {
  test("should do something specific", async ({
    authenticatedPage,
    tierHelper,
  }) => {
    // Arrange
    const page = new AnalyzePage(authenticatedPage);
    await page.goto("AAPL");

    // Act
    await page.searchSymbol("MSFT");

    // Assert
    expect(await page.getTradePlanCount()).toBeGreaterThan(0);
  });
});
```

### Using Page Object Models

Always use Page Objects for maintainability:

```typescript
// ✅ Good: Encapsulated, reusable
const analyzePage = new AnalyzePage(page);
await analyzePage.goto("AAPL");
const count = await analyzePage.getTradePlanCount();

// ❌ Bad: Direct selectors, hard to maintain
await page.goto("/analyze/AAPL");
const count = await page.locator('[data-testid="trade-plan-card"]').count();
```

### Test Fixtures

Use provided fixtures to avoid repetition:

```typescript
// Authenticated user (pre-signed-in)
import { test } from "../../e2e-utils/fixtures/authenticated-user";

test("authenticated test", async ({ authenticatedPage }) => {
  // Page is already signed in
  await authenticatedPage.goto("/dashboard");
});

// Free tier user (authenticated + verified free)
import { test } from "../../e2e-utils/fixtures/free-tier-user";

test("free tier test", async ({ authenticatedPage, tierHelper }) => {
  // Verified as free tier
  const limits = await tierHelper.getTierLimits();
  expect(limits.analysesPerDay).toBe(5);
});
```

### Testing Async Operations

```typescript
// Correct: Wait for network activity to complete
await page.goto("/analyze/AAPL");
await page.waitForLoadState("networkidle");
const count = await page.locator("button").count();

// Better: Use page object method that handles waits
const analyzePage = new AnalyzePage(page);
await analyzePage.goto("AAPL");
// Waits automatically
```

### Testing with Data

```typescript
test("analyze multiple symbols", async ({ authenticatedPage }) => {
  const symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"];
  const page = new AnalyzePage(authenticatedPage);

  for (const symbol of symbols) {
    await page.goto(symbol);
    const count = await page.getTradePlanCount();
    expect(count).toBeGreaterThan(0);
  }
});
```

### Testing Errors

```typescript
test("shows error for invalid symbol", async ({ authenticatedPage }) => {
  const page = new AnalyzePage(authenticatedPage);
  await page.goto("NOTREAL123");

  expect(await page.hasError()).toBe(true);
  const error = await page.getErrorMessage();
  expect(error).toContain("not found");
});
```

---

## Authentication & Fixtures

### How Authentication Works

1. **First run**: Playwright test creates browser, signs in with credentials, saves session to `.auth/user.json`
2. **Subsequent runs**: Tests reuse saved session (fast!)
3. **Session expires**: Delete `.auth/user.json` and re-authenticate

### Using Fixtures

```typescript
// Option 1: Authenticated but no tier verification
import { test } from '../../e2e-utils/fixtures/authenticated-user';
test('auth test', async ({ authenticatedPage, authHelper }) => { ... })

// Option 2: Authenticated + verified free tier
import { test } from '../../e2e-utils/fixtures/free-tier-user';
test('free test', async ({ authenticatedPage, tierHelper }) => { ... })

// Option 3: Custom fixture
test('custom auth', async ({ page }) => {
  const auth = new AuthHelper(page);
  await auth.signIn('email@example.com', 'password');
  // Now page is authenticated
})
```

### Verifying Tier During Tests

```typescript
test("verify tier limits", async ({ authenticatedPage, tierHelper }) => {
  // Get tier
  const tier = await tierHelper.getCurrentTier();
  expect(tier).toBe("free");

  // Get limits
  const limits = await tierHelper.getTierLimits();
  expect(limits.analysesPerDay).toBe(5);
  expect(limits.signalsVisible).toBe(3);

  // Check if feature is locked
  const isLocked = await tierHelper.isFeatureLocked("Portfolio");
  expect(isLocked).toBe(true);
});
```

---

## Page Object Models

### Creating a Page Object

```typescript
import { Page, Locator } from "@playwright/test";

export class MyPage {
  readonly page: Page;
  readonly myButton: Locator;
  readonly myInput: Locator;
  readonly result: Locator;

  constructor(page: Page) {
    this.page = page;
    this.myButton = page.locator('button[data-testid="my-button"]');
    this.myInput = page.locator("input#my-input");
    this.result = page.locator(".result");
  }

  async goto() {
    await this.page.goto("/my-page");
  }

  async doSomething(value: string) {
    await this.myInput.fill(value);
    await this.myButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  async getResult(): Promise<string | null> {
    return await this.result.textContent();
  }
}
```

### Using Page Objects in Tests

```typescript
test("use page object", async ({ authenticatedPage }) => {
  const page = new MyPage(authenticatedPage);
  await page.goto();
  await page.doSomething("test data");

  const result = await page.getResult();
  expect(result).toContain("expected");
});
```

### Best Practices

1. **One page object per page** - MyPage, SettingsPage, etc.
2. **Encapsulate selectors** - Don't expose locators, expose methods
3. **Handle waits in methods** - `goto()` waits for page, `doSomething()` waits for action
4. **Return data from methods** - Make assertions in test, not in page object
5. **Use meaningful names** - `getTradePlanCount()` not `getCount()`

---

## API Testing

### Testing API Endpoints

```typescript
import { test, expect } from "@playwright/test";
import { APIHelper } from "../../e2e-utils/helpers/api-helper";

test("test analyze endpoint", async ({ request }) => {
  const api = new APIHelper(request);

  const data = await api.testAnalyzeEndpoint("AAPL", 200);

  expect(data.signals.length).toBeLessThanOrEqual(3); // Free tier limit
  api.validateAnalyzeResponse(data);
});
```

### Testing Authentication Requirements

```typescript
test("endpoint requires authentication", async ({ request }) => {
  const api = new APIHelper(request);

  // Should return 401 without auth
  await api.testUnauthenticatedRequest("/api/mcp/analyze");
});
```

### Testing Tier-Based Access

```typescript
test("free tier cannot access premium universes", async ({ request }) => {
  const api = new APIHelper(request);

  // Free tier: sp500 ✓
  const sp500Results = await api.testScanEndpoint("sp500", 200);
  expect(sp500Results.qualified_trades.length).toBeLessThanOrEqual(5);

  // Free tier: nasdaq100 ✗
  const nasdaqResults = await api.testScanEndpoint("nasdaq100", 403);
  expect(nasdaqResults).toBeNull();
});
```

### Direct API Testing

```typescript
test("test with raw request", async ({ request }) => {
  const response = await request.post("/api/mcp/analyze", {
    data: { symbol: "AAPL", period: "1mo" },
  });

  expect(response.status()).toBe(200);

  const data = await response.json();
  expect(data).toHaveProperty("signals");
  expect(Array.isArray(data.signals)).toBe(true);
});
```

---

## Production Testing

### Running Against Live Site

```bash
# Run production smoke tests
npm run test:e2e:production

# Or directly
npx playwright test -c playwright.config.production.ts
```

### Production Test Guidelines

⚠️ **Safety First**:

- ✓ Read-only operations only
- ✓ No test data creation
- ✓ No database modifications
- ✓ Test during low-traffic hours
- ✗ Don't create accounts
- ✗ Don't modify settings
- ✗ Don't delete data

### Example Production Test

```typescript
import { test, expect } from "@playwright/test";

test.describe("Production Smoke Tests", () => {
  test.use({
    baseURL: "https://your-production-url.com",
  });

  test("landing page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("sign-in page accessible", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.goto("/pricing");

    expect(errors).toHaveLength(0);
  });
});
```

---

## Debugging

### Debug Mode

```bash
# Step through tests interactively
npm run test:e2e:debug

# Or specific test
npx playwright test e2e/features/analyze-free.spec.ts --debug
```

Opens Playwright Inspector with:

- Step through code
- Inspect elements
- Watch page live
- Evaluate JavaScript

### Headed Mode

```bash
# See browser window while tests run
npm run test:e2e:headed

# Good for understanding test flow
# Stop with Ctrl+C
```

### Slow Motion

```bash
# Add slowMo to config or test
test.use({ launchOptions: { slowMo: 500 } });

test('slow test', async ({ page }) => {
  // Each action waits 500ms - easier to watch
  await page.click('button');
});
```

### Logging

```typescript
test("debug with logging", async ({ page }) => {
  // Log to console
  page.on("console", (msg) => {
    console.log("Browser:", msg.text());
  });

  // Log page navigation
  page.on("request", (req) => {
    console.log("Request:", req.url());
  });

  page.on("response", (res) => {
    console.log("Response:", res.status(), res.url());
  });

  await page.goto("/");
});
```

### Video & Trace

Failures automatically capture:

- Screenshot
- Video (if enabled)
- Trace

```bash
# View trace for failed test
npx playwright show-trace playwright-report/[test-name]/trace.zip
```

---

## Playwright vs Cypress

### Architecture

**Playwright**:

- Runs outside browser (out-of-process)
- Communicates via WebSocket
- Can control multiple browser types
- More like real user

**Cypress**:

- Runs inside browser (in-process)
- Direct JavaScript access
- Limited to Chromium family
- More intrusive hooks

### TypeScript Support

**Playwright**:

- Native TypeScript support ✓
- Excellent IDE support
- Type-safe by default

**Cypress**:

- TypeScript via plugin
- Less IDE support
- More setup required

### Browser Support

**Playwright**:

- Chromium ✓
- Firefox ✓
- WebKit ✓
- Mobile Chrome ✓
- Mobile Safari ✓

**Cypress**:

- Chrome/Chromium ✓
- Firefox (beta)
- Safari (in development)
- No mobile support

### Parallel Execution

**Playwright**:

- Native parallel support ✓
- Splits tests across workers
- Configurable workers count

**Cypress**:

- Limited parallelization
- Works best with CI services
- More expensive at scale

### Network Interception

**Playwright**:

- Complete network control ✓
- Modify requests/responses
- HAR file recording

**Cypress**:

- Network stubbing
- Less flexible
- Better for mocking

### Debugging

**Playwright**:

- Inspector mode
- Trace viewer
- Screenshots/videos

**Cypress**:

- Time-travel debugging
- Interactive runner
- Excellent developer experience

### When to Use Each

**Use Playwright for**:

- Cross-browser testing (Firefox, Safari)
- Mobile testing
- Multiple tabs/windows
- Performance testing
- Large test suites (parallelization)
- TypeScript projects
- API testing alongside UI

**Use Cypress for**:

- Learning E2E testing
- Simple applications
- Developer-centric debugging
- Chromium-only needs
- Quick local testing

### Playwright Advantages

1. ✓ Better TypeScript support
2. ✓ Multiple browser engines
3. ✓ Mobile testing out-of-box
4. ✓ True parallel execution
5. ✓ Network interception
6. ✓ File download handling

### Cypress Advantages

1. ✓ Time-travel debugging
2. ✓ Simpler API for beginners
3. ✓ Better documentation for simple cases
4. ✓ Interactive test runner
5. ✓ Good for single browser testing

---

## Cloud Testing Services

### BrowserStack

**Setup**:

```bash
# Install BrowserStack plugin
npm install --save-dev @playwright/test @browserstack/local

# Configure in playwright.config.ts
use: {
  connectOptions: {
    wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify(caps))}`
  }
}
```

**Benefits**:

- Real devices (iOS, Android)
- Real browsers (Safari on macOS)
- Geolocation testing
- Network throttling

**Documentation**: https://browserstack.com/docs/playwright

### Sauce Labs

**Setup**:

```bash
# Create config file
# .saucelabs.yml
```

**Run**:

```bash
npm install --save-dev saucectl
saucectl run
```

**Benefits**:

- Extensive device library
- Parallel execution
- Integration with CI/CD
- Real device testing

**Documentation**: https://docs.saucelabs.com/web-apps/automated-testing/playwright/

### Percy (Visual Regression)

**Setup**:

```bash
npm install --save-dev @percy/cli @percy/playwright

# In test
import { percySnapshot } from '@percy/playwright';

test('visual test', async ({ page }) => {
  await page.goto('/dashboard');
  await percySnapshot(page, 'Dashboard Home');
});
```

**Run**:

```bash
percy exec -- npm run test:e2e
```

**Benefits**:

- Visual regression testing
- Cross-browser screenshots
- Diff detection
- CI/CD integration

**Documentation**: https://docs.percy.io/

### LambdaTest

**Setup**:

```bash
# Configure with credentials
use: {
  connectOptions: {
    wsEndpoint: `wss://cdp.lambdatest.com/playwright?capability=${JSON.stringify(caps)}`,
  },
}
```

**Benefits**:

- 3000+ real devices
- Multiple browsers
- Parallel testing
- Smart debugging

### Running Tests in Cloud

Example BrowserStack runner:

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    connectOptions: {
      wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(
        JSON.stringify({
          browserName: "firefox",
          browserVersion: "latest",
          os: "Windows",
          osVersion: "10",
          projectName: "MCP Finance Tests",
          buildName: "E2E Tests",
          sessionName: "Test Session",
          userName: process.env.BROWSERSTACK_USERNAME,
          accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
        }),
      )}`,
    },
  },
});
```

Run tests:

```bash
BROWSERSTACK_USERNAME=your_username \
BROWSERSTACK_ACCESS_KEY=your_key \
npm run test:e2e
```

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 60

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - run: npm ci
      - run: npx playwright install --with-deps

      - run: npm run test:e2e

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Environment Variables in CI

Add to GitHub Secrets:

- `TEST_USER_EMAIL`
- `TEST_USER_PASSWORD`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

Then in workflow:

```yaml
- run: npm run test:e2e
  env:
    TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
    TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY }}
```

---

## Troubleshooting

### "TestTimeout: Test timeout of 30000ms exceeded"

**Cause**: Page or action took too long

**Solutions**:

1. Increase timeout: `test.setTimeout(60000)`
2. Add explicit waits: `await page.waitForSelector()`
3. Check MCP API responsiveness
4. Verify network connectivity

### "Element is not attached to the DOM"

**Cause**: Element disappeared between finding and using it

**Solutions**:

1. Re-find element each time
2. Add waitFor before interaction
3. Use page object methods (they re-find)

### "Target page, context or browser has been closed"

**Cause**: Page/context closed unexpectedly

**Solutions**:

1. Check for exceptions in browser logs
2. Add error event listeners
3. Verify browser doesn't crash
4. Check system resources

### "Authentication Failed"

**Cause**: Test user credentials invalid or tier not set

**Solutions**:

1. Verify TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.test
2. Check user exists in Clerk Dashboard
3. Verify public metadata: `{ "tier": "free" }`
4. Delete `.auth/user.json` and re-authenticate
5. Check Clerk webhook configuration

### "Cannot find chrome/firefox/webkit"

**Cause**: Browsers not installed

**Solutions**:

```bash
npx playwright install
# Or specific browser
npx playwright install chromium
```

### Tests Pass Locally but Fail in CI

**Cause**: Environment differences

**Solutions**:

1. Ensure all env vars set in CI
2. Check Node version matches
3. Use same OS as CI (use docker if needed)
4. Add verbose logging: `DEBUG=pw:api`
5. Check timezone settings

### Flaky Tests (Pass/Fail randomly)

**Cause**: Race conditions, timing issues

**Solutions**:

1. Use explicit waits: `page.waitForSelector()`
2. Use `waitForLoadState('networkidle')`
3. Avoid arbitrary `sleep()` calls
4. Use `.toBeVisible()` instead of `.isVisible()`
5. Increase timeouts in CI only

---

## Best Practices

### Test Organization

1. **One test = one behavior**

   ```typescript
   // ✓ Good
   test('free users see only swing timeframe', async (...) => {
     expect(timeframes).toEqual(['swing']);
   });

   // ✗ Bad: Testing too much
   test('analyze page works', async (...) => {
     // Tests timeframe, limits, results, etc.
   });
   ```

2. **Descriptive test names**

   ```typescript
   // ✓ Good
   test("should show upgrade prompt when free user clicks portfolio");

   // ✗ Bad
   test("test portfolio");
   ```

3. **AAA Pattern**: Arrange, Act, Assert

   ```typescript
   test("example", async ({ page }) => {
     // Arrange
     const sidebar = new Sidebar(page);

     // Act
     await sidebar.goto();

     // Assert
     expect(await sidebar.getTier()).toBe("free");
   });
   ```

### Performance

1. **Reuse authentication** - Use `.auth/user.json`
2. **Parallel execution** - Playwright default
3. **Minimal navigation** - Avoid unnecessary page changes
4. **Wait efficiently** - Use `networkidle` not arbitrary sleeps

### Maintenance

1. **Centralize selectors** - In `e2e-utils/constants/selectors.ts`
2. **Use Page Objects** - Don't repeat selectors
3. **Avoid hard-coding** - Use constants, environment variables
4. **Document complex tests** - Add comments for non-obvious logic
5. **Keep tests independent** - No shared state between tests

### Security

1. **Use environment variables** - Never hardcode credentials
2. **Keep .env.test in .gitignore** - Never commit test credentials
3. **Don't test with production data** - Use test accounts
4. **Rotate test credentials regularly** - Change passwords
5. **Limit scope of test users** - Minimal permissions needed

---

## Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Clerk Testing Guide](https://clerk.com/docs/testing)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [Our Testing Guide](./TESTING_GUIDE.md) - Unit tests and other testing approaches

---

## Support & Issues

### Getting Help

1. **Check this guide** - Most common issues covered
2. **Read Playwright docs** - Comprehensive documentation
3. **Check browser console** - Look for JavaScript errors
4. **Run in debug mode** - `npm run test:e2e:debug`
5. **Check GitHub issues** - Search for similar problems

### Reporting Issues

Include:

- Test name and file
- Error message and full stack trace
- Screenshot/video if available
- Environment info (OS, Node version)
- Steps to reproduce
- `npm ls | head -20` output

---

## Maintenance Checklist

- [ ] Playwright updated quarterly
- [ ] Selectors verified after UI changes
- [ ] Page objects updated with new features
- [ ] Test data refreshed monthly
- [ ] CI/CD configuration reviewed
- [ ] Cloud service credentials rotated
- [ ] .auth/ files cleaned before commits
- [ ] test-results/ artifacts cleaned
- [ ] Documentation updated with new tests
- [ ] Performance baselines checked

---

**Last Updated**: 2024
**Maintained by**: Development Team
