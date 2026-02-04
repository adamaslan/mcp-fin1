import { test, expect } from "../fixtures/authenticated-user";

test.describe("Stock Analysis Page", () => {
  test("loads analysis page for valid symbol", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/analyze/AAPL");

    // Page should load without error
    await expect(authenticatedPage.locator("body")).not.toContainText(
      "page mismatch",
    );

    // Should show symbol somewhere
    await expect(authenticatedPage.locator("text=/AAPL/i").first()).toBeVisible(
      { timeout: 15000 },
    );
  });

  test("displays analysis results with signals", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/analyze/AAPL");

    // Wait for results to load
    await authenticatedPage.waitForLoadState("networkidle");

    // Should show some analysis content
    await expect(
      authenticatedPage.locator("text=/signal|indicator|analysis/i").first(),
    ).toBeVisible({ timeout: 20000 });
  });

  test("shows timeframe selector (tier-gated)", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/analyze/AAPL");

    // Timeframe selector should exist
    await expect(
      authenticatedPage.locator("text=/swing|day|scalp|timeframe/i").first(),
    ).toBeVisible({ timeout: 15000 });
  });

  test("displays tier limit indicator", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/analyze/AAPL");

    // Should show limit text for free tier
    await expect(
      authenticatedPage.locator("text=/top 3|limit|showing/i").first(),
    ).toBeVisible({ timeout: 15000 });
  });

  test("handles invalid symbol gracefully", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/analyze/INVALIDXYZ123");

    // Should show error or "not found" message, not crash
    await authenticatedPage.waitForLoadState("networkidle");

    const content = await authenticatedPage.content();
    expect(content.toLowerCase()).toMatch(/error|not found|invalid|no data/);
  });

  test("different symbols load correctly", async ({ authenticatedPage }) => {
    const symbols = ["MSFT", "GOOGL", "TSLA"];

    for (const symbol of symbols) {
      await authenticatedPage.goto(`/analyze/${symbol}`);
      await authenticatedPage.waitForLoadState("networkidle");

      // Should show the symbol
      await expect(
        authenticatedPage.locator(`text=/${symbol}/i`).first(),
      ).toBeVisible({ timeout: 15000 });
    }
  });
});
