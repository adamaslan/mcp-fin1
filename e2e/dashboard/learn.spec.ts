import { test, expect } from "../fixtures/authenticated-user";

test.describe("Learn - Indicators Page", () => {
  test("loads indicators learning page", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/learn/indicators");

    await expect(
      authenticatedPage.locator("text=/indicator/i").first(),
    ).toBeVisible();
  });

  test("displays indicator explanations", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/learn/indicators");

    // Should have educational content
    await expect(
      authenticatedPage
        .locator("text=/RSI|MACD|moving average|SMA|EMA/i")
        .first(),
    ).toBeVisible();
  });
});

test.describe("Learn - Signals Page", () => {
  test("loads signals learning page", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/learn/signals");

    await expect(
      authenticatedPage.locator("text=/signal/i").first(),
    ).toBeVisible();
  });

  test("displays signal explanations", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/learn/signals");

    // Should have signal educational content
    await expect(
      authenticatedPage.locator("text=/bullish|bearish|buy|sell/i").first(),
    ).toBeVisible();
  });
});
