import { test, expect } from "@playwright/test";

test.describe("API Docs Page", () => {
  test("loads API docs page", async ({ page }) => {
    await page.goto("/api-docs");

    await expect(
      page.locator("text=/api|documentation|endpoint/i").first(),
    ).toBeVisible();
  });

  test("displays endpoint documentation", async ({ page }) => {
    await page.goto("/api-docs");

    // Should show API endpoints
    await expect(
      page.locator("text=/GET|POST|endpoint|request|response/i").first(),
    ).toBeVisible();
  });
});
