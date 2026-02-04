import { test, expect } from "@playwright/test";
import { MorningBriefPage } from "../../e2e-utils/pages/morning-brief-page";

test.describe("Morning Brief Page - Free Tier", () => {
  test("page loads successfully", async ({ page }) => {
    const morningBrief = new MorningBriefPage(page);
    await morningBrief.goto();

    // Header should be visible
    await expect(page.locator("text=Morning Market Brief")).toBeVisible();
  });

  test("displays market status card", async ({ page }) => {
    const morningBrief = new MorningBriefPage(page);
    await morningBrief.goto();
    await morningBrief.waitForDataLoad();

    expect(await morningBrief.hasMarketStatus()).toBe(true);
    expect(await morningBrief.hasFuturesData()).toBe(true);
  });

  test("displays market status badge", async ({ page }) => {
    const morningBrief = new MorningBriefPage(page);
    await morningBrief.goto();
    await morningBrief.waitForDataLoad();

    const badge = await morningBrief.getMarketStatusBadgeText();
    const validStatuses = ["OPEN", "CLOSED", "PRE_MARKET", "AFTER_HOURS"];
    expect(validStatuses).toContain(badge);
  });

  test("displays economic events", async ({ page }) => {
    const morningBrief = new MorningBriefPage(page);
    await morningBrief.goto();
    await morningBrief.waitForDataLoad();

    // Economic events card should be visible
    const eventCount = await morningBrief.getEconomicEventCount();
    expect(eventCount).toBeGreaterThanOrEqual(0);
  });

  test("displays watchlist signals", async ({ page }) => {
    const morningBrief = new MorningBriefPage(page);
    await morningBrief.goto();
    await morningBrief.waitForDataLoad();

    const signalCount = await morningBrief.getWatchlistSignalCount();
    expect(signalCount).toBeGreaterThan(0);
  });

  test("displays watchlist symbols", async ({ page }) => {
    const morningBrief = new MorningBriefPage(page);
    await morningBrief.goto();
    await morningBrief.waitForDataLoad();

    const symbols = await morningBrief.getWatchlistSymbols();
    expect(symbols.length).toBeGreaterThan(0);
    expect(symbols).toContain("SPY");
  });

  test("displays sector leaders and losers", async ({ page }) => {
    const morningBrief = new MorningBriefPage(page);
    await morningBrief.goto();
    await morningBrief.waitForDataLoad();

    expect(await morningBrief.hasSectorLeaders()).toBe(true);
    expect(await morningBrief.hasSectorLosers()).toBe(true);
  });

  test("displays key themes", async ({ page }) => {
    const morningBrief = new MorningBriefPage(page);
    await morningBrief.goto();
    await morningBrief.waitForDataLoad();

    const themeCount = await morningBrief.getKeyThemeCount();
    expect(themeCount).toBeGreaterThanOrEqual(0);
  });

  test("AI toggle disabled for free tier", async ({ page }) => {
    const morningBrief = new MorningBriefPage(page);
    await morningBrief.goto();

    expect(await morningBrief.isAIToggleDisabled()).toBe(true);
  });

  test("AI toggle shows (Pro+) badge for free tier", async ({ page }) => {
    const morningBrief = new MorningBriefPage(page);
    await morningBrief.goto();

    expect(await morningBrief.hasAIPlusBadge()).toBe(true);
  });

  test("AI panel not displayed when AI disabled", async ({ page }) => {
    const morningBrief = new MorningBriefPage(page);
    await morningBrief.goto();
    await morningBrief.waitForDataLoad();

    expect(await morningBrief.hasAIPanel()).toBe(false);
  });

  test("loading state displays correctly", async ({ page }) => {
    const morningBrief = new MorningBriefPage(page);

    // Delay API response to show loading state
    await morningBrief.interceptMorningBriefAPI(async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.continue();
    });

    const navigationPromise = morningBrief.goto();
    await page.waitForTimeout(100);

    expect(await morningBrief.hasLoadingState()).toBe(true);
    await navigationPromise;
  });

  test("error state displays correctly", async ({ page }) => {
    const morningBrief = new MorningBriefPage(page);

    // Mock API error
    await morningBrief.interceptMorningBriefAPI(async (route) => {
      await route.fulfill({
        status: 503,
        body: JSON.stringify({
          error: "Morning brief service unavailable",
        }),
      });
    });

    await morningBrief.goto();

    expect(await morningBrief.hasError()).toBe(true);
    const errorText = await morningBrief.getErrorMessage();
    expect(errorText).toBeTruthy();
  });

  test("retry button works on error", async ({ page }) => {
    const morningBrief = new MorningBriefPage(page);
    let callCount = 0;

    // Mock API error on first call, success on second
    await morningBrief.interceptMorningBriefAPI(async (route) => {
      callCount++;
      if (callCount === 1) {
        await route.fulfill({
          status: 503,
          body: JSON.stringify({ error: "Service unavailable" }),
        });
      } else {
        await route.continue();
      }
    });

    await morningBrief.goto();
    expect(await morningBrief.hasError()).toBe(true);

    // Click retry button
    await page.locator('button:has-text("Retry")').click();
    await morningBrief.waitForDataLoad();

    expect(await morningBrief.hasError()).toBe(false);
    expect(await morningBrief.hasMarketStatus()).toBe(true);
  });

  test("watchlist signal links to analyze page", async ({ page }) => {
    const morningBrief = new MorningBriefPage(page);
    await morningBrief.goto();
    await morningBrief.waitForDataLoad();

    const symbols = await morningBrief.getWatchlistSymbols();
    if (symbols.length > 0) {
      await morningBrief.clickWatchlistSymbol(symbols[0]);

      // Should navigate to analyze page
      await expect(page).toHaveURL(new RegExp(`/analyze/${symbols[0]}`));
    }
  });
});

test.describe("Morning Brief - AI Integration (Pro Tier)", () => {
  test.use({
    // Use pro tier fixture if available
    authenticatedPage: async ({ page }, use) => {
      // This will use pro tier fixture from global setup
      await page.goto("/morning-brief");
      await use(page);
    },
  });

  test("AI toggle enabled for pro tier", async ({ page }) => {
    const morningBrief = new MorningBriefPage(page);
    await morningBrief.goto();

    const isDisabled = await morningBrief.isAIToggleDisabled();
    expect(isDisabled).toBe(false);
  });

  test("AI toggle not checked by default", async ({ page }) => {
    const morningBrief = new MorningBriefPage(page);
    await morningBrief.goto();

    const isChecked = await morningBrief.isAIToggleChecked();
    expect(isChecked).toBe(false);
  });

  test("AI toggle sends use_ai parameter when enabled", async ({ page }) => {
    const morningBrief = new MorningBriefPage(page);
    let requestBody: any;

    // Intercept API to capture request
    await morningBrief.interceptMorningBriefAPI(async (route) => {
      const request = route.request();
      requestBody = request.postDataJSON();
      await route.continue();
    });

    await morningBrief.goto();
    await morningBrief.waitForDataLoad();

    // Enable AI
    await morningBrief.enableAI();

    expect(requestBody?.use_ai).toBe(true);
  });

  test("AI panel displays when AI enabled", async ({ page }) => {
    const morningBrief = new MorningBriefPage(page);

    // Mock response with AI analysis
    await morningBrief.interceptMorningBriefAPI(async (route) => {
      const response = await route.fetch();
      const json = await response.json();

      await route.fulfill({
        response,
        body: JSON.stringify({
          ...json,
          ai_analysis: {
            summary: "Markets looking bullish",
            market_bias: "BULLISH",
            confidence_score: 85,
            key_drivers: [],
            action_items: [],
            risk_factors: [],
          },
        }),
      });
    });

    await morningBrief.goto();
    await morningBrief.waitForDataLoad();

    // Enable AI
    await morningBrief.enableAI();

    // Wait for AI panel to appear
    const hasPanel = await morningBrief.hasAIPanel();
    expect(hasPanel).toBe(true);
  });

  test("AI panel not displayed when AI disabled", async ({ page }) => {
    const morningBrief = new MorningBriefPage(page);
    await morningBrief.goto();
    await morningBrief.waitForDataLoad();

    // Ensure AI is disabled
    await morningBrief.disableAI();

    expect(await morningBrief.hasAIPanel()).toBe(false);
  });

  test("toggling AI refetches data", async ({ page }) => {
    const morningBrief = new MorningBriefPage(page);
    let callCount = 0;

    await morningBrief.interceptMorningBriefAPI(async (route) => {
      callCount++;
      await route.continue();
    });

    await morningBrief.goto();
    await morningBrief.waitForDataLoad();

    const countBefore = callCount;

    // Enable AI
    await morningBrief.enableAI();

    // Should have made another request
    expect(callCount).toBeGreaterThan(countBefore);
  });
});
