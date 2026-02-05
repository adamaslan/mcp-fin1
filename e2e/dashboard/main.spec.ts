import { test, expect } from "../fixtures/authenticated-user";

test.describe("Main Dashboard", () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/dashboard");
  });

  test("displays welcome message", async ({ authenticatedPage }) => {
    await expect(
      authenticatedPage.locator("text=/welcome back/i"),
    ).toBeVisible();
  });

  test("shows market snapshot card with futures data", async ({
    authenticatedPage,
  }) => {
    // Market Snapshot card
    await expect(
      authenticatedPage.locator("text=/market snapshot/i"),
    ).toBeVisible();

    // ES Futures
    await expect(
      authenticatedPage.locator("text=/ES Futures|futures_es/i"),
    ).toBeVisible();

    // NQ Futures
    await expect(
      authenticatedPage.locator("text=/NQ Futures|futures_nq/i"),
    ).toBeVisible();
  });

  test("displays VIX level with status indicator", async ({
    authenticatedPage,
  }) => {
    await expect(authenticatedPage.locator("text=/vix/i")).toBeVisible();
  });

  test("shows daily usage stats with progress bars", async ({
    authenticatedPage,
  }) => {
    // Usage card
    await expect(
      authenticatedPage.locator("text=/daily usage|usage/i"),
    ).toBeVisible();

    // Analyses counter
    await expect(authenticatedPage.locator("text=/analys/i")).toBeVisible();

    // Scans counter
    await expect(authenticatedPage.locator("text=/scan/i")).toBeVisible();
  });

  test("displays quick action cards", async ({ authenticatedPage }) => {
    // Analyze a Stock card
    await expect(
      authenticatedPage.locator("text=/analyze a stock/i"),
    ).toBeVisible();

    // Scan for Trades card
    await expect(
      authenticatedPage.locator("text=/scan for trades/i"),
    ).toBeVisible();

    // Learn Signals card
    await expect(
      authenticatedPage.locator("text=/learn signals/i"),
    ).toBeVisible();
  });

  test("quick action links navigate correctly", async ({
    authenticatedPage,
  }) => {
    // Click "Start Analysis" link
    const analyzeLink = authenticatedPage
      .locator('a[href*="/analyze"]')
      .first();
    await analyzeLink.click();
    await expect(authenticatedPage).toHaveURL(/analyze/);
  });

  test("shows getting started guide", async ({ authenticatedPage }) => {
    await expect(
      authenticatedPage.locator("text=/getting started/i"),
    ).toBeVisible();
  });
});
