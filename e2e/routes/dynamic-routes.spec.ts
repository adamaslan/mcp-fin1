import { test, expect } from "@playwright/test";

test.describe("Dynamic Routes", () => {
  test("analyze/[symbol] loads with valid symbol", async ({ page }) => {
    // This would have caught the route mismatch error
    const response = await page.goto("/analyze/AAPL");

    expect(response?.status()).toBeLessThan(500);

    // Verify no "page mismatch" errors
    const pageContent = await page.content();
    expect(pageContent).not.toContain("page mismatch");
  });

  test("analyze/[symbol] handles invalid symbols gracefully", async ({
    page,
  }) => {
    const response = await page.goto("/analyze/INVALID_SYMBOL_12345");

    // Should return 404 or show error UI, not crash
    expect(response?.status()).toBeLessThan(500);
  });
});
