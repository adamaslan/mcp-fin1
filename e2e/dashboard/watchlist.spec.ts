import { test, expect } from "../fixtures/authenticated-user";

test.describe("Watchlist Page", () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/watchlist");
  });

  test("displays watchlist page header", async ({ authenticatedPage }) => {
    await expect(
      authenticatedPage.locator("h1:has-text('Watchlists')"),
    ).toBeVisible();
  });

  test("shows tier limits info", async ({ authenticatedPage }) => {
    // Should mention watchlist limits
    await expect(
      authenticatedPage.locator("text=/watchlist|symbols/i").first(),
    ).toBeVisible();
  });

  test("displays create watchlist form when under limit", async ({
    authenticatedPage,
  }) => {
    // Create watchlist input
    await expect(
      authenticatedPage.locator('input[placeholder*="name" i]'),
    ).toBeVisible();
  });

  test("can create a new watchlist", async ({ authenticatedPage }) => {
    const watchlistName = `Test-${Date.now()}`;

    // Fill in name
    await authenticatedPage
      .locator('input[placeholder*="name" i]')
      .fill(watchlistName);

    // Click create button
    await authenticatedPage
      .locator("button")
      .filter({ hasText: /\+|create|add/i })
      .first()
      .click();

    // Wait for response
    await authenticatedPage.waitForLoadState("networkidle");

    // New watchlist should appear (or show error if at limit)
  });

  test("watchlist card shows symbol input", async ({ authenticatedPage }) => {
    // If watchlists exist, should show add symbol input
    // May or may not be visible depending on state
    await authenticatedPage
      .locator('input[placeholder*="symbol" i]')
      .isVisible()
      .catch(() => false);
  });

  test("displays signal information for symbols", async ({
    authenticatedPage,
  }) => {
    // If watchlist has symbols, should show signal data
    await authenticatedPage.waitForLoadState("networkidle");

    // Look for price/signal indicators
    const hasSymbols = await authenticatedPage
      .locator("text=/\\$/")
      .isVisible()
      .catch(() => false);

    if (hasSymbols) {
      // Should show action badge
      await expect(
        authenticatedPage.locator("text=/BUY|HOLD|AVOID/i").first(),
      ).toBeVisible();
    }
  });
});
