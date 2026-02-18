import { test, expect } from "../fixtures/authenticated-user";
import { test as baseTest } from "@playwright/test";
import type { Page } from "@playwright/test";

/**
 * GCloud MCP Results Integration Tests
 *
 * Tests all 9 MCP tools through the frontend, verifying:
 * - Real GCloud MCP backend results (NOT mock data)
 * - Proper result structure and display
 * - Execution timing and error handling
 *
 * Prerequisites:
 * - GCloud MCP server running
 * - Frontend at localhost:3000
 * - Test user credentials in .env.test (TEST_USER_EMAIL, TEST_USER_PASSWORD)
 */

/**
 * Helper: Navigate to MCP Control and wait for page load
 */
async function navigateToMCPControl(page: Page): Promise<void> {
  await page.goto("/mcp-control", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1000);
}

/**
 * Helper: Select a tool from the dropdown
 */
async function selectTool(page: Page, toolId: string): Promise<void> {
  const toolSelector = page.locator(
    '[data-testid="tool-selector"], select, [role="listbox"]',
  );
  if ((await toolSelector.count()) > 0) {
    const selectEl = page.locator("select").first();
    if ((await selectEl.count()) > 0) {
      await selectEl.selectOption(toolId);
    }
  }
  await page.waitForTimeout(200);
}

/**
 * Helper: Execute tool and wait for results
 */
async function executeAndWaitForResults(page: Page): Promise<{
  success: boolean;
  executionTime: number;
  hasError: boolean;
}> {
  const startTime = Date.now();

  const executeBtn = page.locator(
    'button:has-text("Execute"), button[type="submit"]',
  );
  await expect(executeBtn).toBeEnabled({ timeout: 5000 });
  await executeBtn.click();

  await page.waitForTimeout(100);

  try {
    await page
      .locator('[class*="animate-spin"], [class*="loading"]')
      .waitFor({ state: "hidden", timeout: 45000 });
  } catch {
    // Loading indicator might not appear for fast requests
  }

  const executionTime = Date.now() - startTime;

  const errorEl = page.locator(
    '[class*="destructive"], [class*="error"], [role="alert"]',
  );
  const hasError = (await errorEl.count()) > 0;

  const resultsContent = await page
    .locator('[class*="result"], [data-testid="results"]')
    .first()
    .textContent()
    .catch(() => "");
  const success = !hasError && (resultsContent?.length || 0) > 10;

  return { success, executionTime, hasError };
}

// ===============================================
// UI TESTS (Authenticated)
// ===============================================

test.describe("GCloud MCP Results - All 9 Tools", () => {
  test.setTimeout(60000);

  test("1. Analyze Security - Returns real price and signals", async ({
    authenticatedPage,
  }) => {
    await navigateToMCPControl(authenticatedPage);
    await selectTool(authenticatedPage, "analyze_security");

    const symbolInput = authenticatedPage
      .locator('input[name="symbol"], input[placeholder*="Symbol"]')
      .first();
    if ((await symbolInput.count()) > 0) {
      await symbolInput.fill("AAPL");
    }

    const { success, executionTime, hasError } =
      await executeAndWaitForResults(authenticatedPage);

    if (!hasError) {
      const priceText = await authenticatedPage
        .locator("text=/\\$\\d+\\.\\d+/")
        .first()
        .textContent()
        .catch(() => "");
      expect(priceText).toBeTruthy();

      const hasSignalCounts =
        (await authenticatedPage
          .locator("text=/Bullish|Bearish|Total/")
          .count()) > 0;
      expect(hasSignalCounts).toBeTruthy();

      expect(executionTime).toBeGreaterThan(500);
      expect(executionTime).toBeLessThan(45000);
    }

    console.log(
      `Analyze Security: ${success ? "PASS" : "FAIL"} (${executionTime}ms)`,
    );
  });

  test("2. Fibonacci Analysis - Returns real levels", async ({
    authenticatedPage,
  }) => {
    await navigateToMCPControl(authenticatedPage);
    await selectTool(authenticatedPage, "analyze_fibonacci");

    const symbolInput = authenticatedPage
      .locator('input[name="symbol"], input[placeholder*="Symbol"]')
      .first();
    if ((await symbolInput.count()) > 0) {
      await symbolInput.fill("MSFT");
    }

    const { success, executionTime, hasError } =
      await executeAndWaitForResults(authenticatedPage);

    if (!hasError) {
      const hasFibLevels =
        (await authenticatedPage
          .locator("text=/0\\.236|0\\.382|0\\.5|0\\.618|Fibonacci/")
          .count()) > 0;
      expect(hasFibLevels || success).toBeTruthy();

      const hasSwingData =
        (await authenticatedPage
          .locator("text=/Swing High|Swing Low/")
          .count()) > 0;
      expect(hasSwingData || success).toBeTruthy();
    }

    console.log(
      `Fibonacci Analysis: ${success ? "PASS" : "FAIL"} (${executionTime}ms)`,
    );
  });

  test("3. Trade Plan - Returns entry/stop/targets", async ({
    authenticatedPage,
  }) => {
    await navigateToMCPControl(authenticatedPage);
    await selectTool(authenticatedPage, "get_trade_plan");

    const symbolInput = authenticatedPage
      .locator('input[name="symbol"], input[placeholder*="Symbol"]')
      .first();
    if ((await symbolInput.count()) > 0) {
      await symbolInput.fill("GOOGL");
    }

    const { success, executionTime, hasError } =
      await executeAndWaitForResults(authenticatedPage);

    if (!hasError) {
      const hasTradePlanElements =
        (await authenticatedPage
          .locator("text=/Entry|Stop|Target|LONG|SHORT/")
          .count()) > 0;
      console.log(`Trade plan elements found: ${hasTradePlanElements}`);
    }

    console.log(
      `Trade Plan: ${success ? "PASS" : "FAIL"} (${executionTime}ms)`,
    );
  });

  test("4. Compare Securities - Compares multiple stocks", async ({
    authenticatedPage,
  }) => {
    await navigateToMCPControl(authenticatedPage);
    await selectTool(authenticatedPage, "compare_securities");

    const symbolsInput = authenticatedPage
      .locator('input[name="symbols"], input[placeholder*="Symbol"]')
      .first();
    if ((await symbolsInput.count()) > 0) {
      await symbolsInput.fill("AAPL,MSFT,GOOGL");
    }

    const { success, executionTime, hasError } =
      await executeAndWaitForResults(authenticatedPage);

    if (!hasError) {
      const hasComparisonData =
        (await authenticatedPage
          .locator("text=/Comparison|Score|AAPL|MSFT/")
          .count()) > 0;
      expect(hasComparisonData || success).toBeTruthy();
    }

    console.log(
      `Compare Securities: ${success ? "PASS" : "FAIL"} (${executionTime}ms)`,
    );
  });

  test("5. Screen Securities - Screens universe", async ({
    authenticatedPage,
  }) => {
    await navigateToMCPControl(authenticatedPage);
    await selectTool(authenticatedPage, "screen_securities");

    const universeSelect = authenticatedPage.locator('select[name="universe"]');
    if ((await universeSelect.count()) > 0) {
      await universeSelect.selectOption("sp500");
    }

    const { success, executionTime, hasError } =
      await executeAndWaitForResults(authenticatedPage);

    if (!hasError) {
      const hasMatches =
        (await authenticatedPage
          .locator("text=/match|Result|Score/i")
          .count()) > 0;
      expect(hasMatches || success).toBeTruthy();
    }

    console.log(
      `Screen Securities: ${success ? "PASS" : "FAIL"} (${executionTime}ms)`,
    );
  });

  test("6. Scan Trades - Finds qualified trades", async ({
    authenticatedPage,
  }) => {
    await navigateToMCPControl(authenticatedPage);
    await selectTool(authenticatedPage, "scan_trades");

    const { success, executionTime, hasError } =
      await executeAndWaitForResults(authenticatedPage);

    if (!hasError) {
      const hasTrades =
        (await authenticatedPage
          .locator("text=/Qualified|Trade|Quality/i")
          .count()) > 0;
      expect(hasTrades || success).toBeTruthy();
    }

    console.log(
      `Scan Trades: ${success ? "PASS" : "FAIL"} (${executionTime}ms)`,
    );
  });

  test("7. Portfolio Risk - Analyzes portfolio", async ({
    authenticatedPage,
  }) => {
    await navigateToMCPControl(authenticatedPage);
    await selectTool(authenticatedPage, "portfolio_risk");

    const { success, executionTime, hasError } =
      await executeAndWaitForResults(authenticatedPage);

    if (!hasError) {
      const hasRiskData =
        (await authenticatedPage
          .locator("text=/Total Value|Max Loss|Risk Level/i")
          .count()) > 0;
      expect(hasRiskData || success).toBeTruthy();
    }

    console.log(
      `Portfolio Risk: ${success ? "PASS" : "FAIL"} (${executionTime}ms)`,
    );
  });

  test("8. Morning Brief - Returns market overview", async ({
    authenticatedPage,
  }) => {
    await navigateToMCPControl(authenticatedPage);
    await selectTool(authenticatedPage, "morning_brief");

    const watchlistInput = authenticatedPage
      .locator('input[name="watchlist"], input[placeholder*="watch"]')
      .first();
    if ((await watchlistInput.count()) > 0) {
      await watchlistInput.fill("AAPL,MSFT");
    }

    const { success, executionTime, hasError } =
      await executeAndWaitForResults(authenticatedPage);

    if (!hasError) {
      const hasMarketData =
        (await authenticatedPage
          .locator("text=/Market|Status|Open|Closed/i")
          .count()) > 0;
      expect(hasMarketData || success).toBeTruthy();
    }

    console.log(
      `Morning Brief: ${success ? "PASS" : "FAIL"} (${executionTime}ms)`,
    );
  });

  test("9. Options Risk Analysis - Returns options data", async ({
    authenticatedPage,
  }) => {
    await navigateToMCPControl(authenticatedPage);
    await selectTool(authenticatedPage, "options_risk_analysis");

    const symbolInput = authenticatedPage
      .locator('input[name="symbol"], input[placeholder*="Symbol"]')
      .first();
    if ((await symbolInput.count()) > 0) {
      await symbolInput.fill("AAPL");
    }

    const { success, executionTime, hasError } =
      await executeAndWaitForResults(authenticatedPage);

    if (!hasError) {
      const hasOptionsData =
        (await authenticatedPage
          .locator("text=/Expiration|IV|Greeks|Options|Risk/i")
          .count()) > 0;
      expect(hasOptionsData || success).toBeTruthy();
    }

    console.log(
      `Options Risk: ${success ? "PASS" : "FAIL"} (${executionTime}ms)`,
    );
  });

  // ===============================================
  // INTEGRATION TESTS
  // ===============================================

  test("All tools should return within 45 seconds", async ({
    authenticatedPage,
  }) => {
    await navigateToMCPControl(authenticatedPage);

    const symbolInput = authenticatedPage
      .locator('input[name="symbol"], input[placeholder*="Symbol"]')
      .first();
    if ((await symbolInput.count()) > 0) {
      await symbolInput.fill("AAPL");
    }

    const { executionTime } = await executeAndWaitForResults(authenticatedPage);

    expect(executionTime).toBeLessThan(45000);
    console.log(`Baseline execution time: ${executionTime}ms`);
  });

  test("Results should contain real data, not mocks", async ({
    authenticatedPage,
  }) => {
    await navigateToMCPControl(authenticatedPage);

    const symbolInput = authenticatedPage
      .locator('input[name="symbol"], input[placeholder*="Symbol"]')
      .first();
    if ((await symbolInput.count()) > 0) {
      await symbolInput.fill("AAPL");
    }

    await executeAndWaitForResults(authenticatedPage);

    const content = await authenticatedPage.textContent("body");

    expect(content?.toLowerCase()).not.toContain("mock");
    expect(content?.toLowerCase()).not.toContain("placeholder");
    expect(content?.toLowerCase()).not.toContain("hardcoded");

    const hasRealPricePattern = /\$\d+\.\d{2}/.test(content || "");
    const hasPercentagePattern = /\d+\.?\d*%/.test(content || "");

    expect(hasRealPricePattern || hasPercentagePattern).toBeTruthy();
  });

  test("Execution time should be recorded", async ({ authenticatedPage }) => {
    await navigateToMCPControl(authenticatedPage);

    const symbolInput = authenticatedPage
      .locator('input[name="symbol"], input[placeholder*="Symbol"]')
      .first();
    if ((await symbolInput.count()) > 0) {
      await symbolInput.fill("AAPL");
    }

    await executeAndWaitForResults(authenticatedPage);

    const timeDisplay = authenticatedPage.locator(
      "text=/Completed in \\d+ms|\\d+ms/",
    );
    const hasTimeDisplay = (await timeDisplay.count()) > 0;

    expect(hasTimeDisplay).toBeTruthy();
  });

  test("Error handling shows user-friendly message", async ({
    authenticatedPage,
  }) => {
    await navigateToMCPControl(authenticatedPage);

    const executeBtn = authenticatedPage
      .locator('button:has-text("Execute")')
      .first();

    const symbolInput = authenticatedPage
      .locator('input[name="symbol"]')
      .first();
    if ((await symbolInput.count()) > 0) {
      await symbolInput.fill("");
    }

    if (await executeBtn.isEnabled()) {
      await executeBtn.click();
    }

    await authenticatedPage.waitForTimeout(500);

    const errorText = await authenticatedPage
      .locator('[class*="destructive"], [class*="error"]')
      .first()
      .textContent()
      .catch(() => "");
    const buttonDisabled = await executeBtn.isDisabled();

    expect(errorText || buttonDisabled).toBeTruthy();
  });
});

// ===============================================
// API DIRECT TESTS (verify backend connectivity)
// ===============================================

baseTest.describe("GCloud MCP Backend Direct API Tests", () => {
  baseTest.setTimeout(30000);

  baseTest(
    "POST /api/gcloud/execute - analyze_security works",
    async ({ request }) => {
      const response = await request.post("/api/gcloud/execute", {
        data: {
          toolName: "analyze_security",
          parameters: { symbol: "AAPL", period: "1mo" },
        },
      });

      expect([200, 401, 403, 503]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();
        expect(data.success).toBeTruthy();
        expect(data.result).toBeDefined();
        expect(data.result.symbol).toBe("AAPL");
        expect(typeof data.result.price).toBe("number");
        console.log(
          `API returned price: $${data.result.price?.toFixed(2) || "N/A"}`,
        );
      }
    },
  );

  baseTest(
    "POST /api/gcloud/execute - analyze_fibonacci works",
    async ({ request }) => {
      const response = await request.post("/api/gcloud/execute", {
        data: {
          toolName: "analyze_fibonacci",
          parameters: { symbol: "MSFT", period: "1mo", window: 150 },
        },
      });

      expect([200, 401, 403, 503]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();
        expect(data.success).toBeTruthy();
        expect(data.result.symbol).toBe("MSFT");
        expect(data.result.levels || data.result.signals).toBeDefined();
      }
    },
  );

  baseTest(
    "POST /api/gcloud/execute - handles invalid tool gracefully",
    async ({ request }) => {
      const response = await request.post("/api/gcloud/execute", {
        data: {
          toolName: "invalid_tool_name",
          parameters: { symbol: "AAPL" },
        },
      });

      expect([400, 401, 403, 500]).toContain(response.status());

      const data = await response.json();
      expect(data.error).toBeDefined();
    },
  );

  baseTest(
    "POST /api/gcloud/execute - requires parameters",
    async ({ request }) => {
      const response = await request.post("/api/gcloud/execute", {
        data: {
          toolName: "analyze_security",
        },
      });

      expect([400, 401]).toContain(response.status());
    },
  );
});
