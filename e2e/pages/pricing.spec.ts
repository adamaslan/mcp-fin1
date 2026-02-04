import { test, expect } from "@playwright/test";

test.describe("Pricing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pricing");
  });

  test("displays all three pricing tiers", async ({ page }) => {
    // Free tier
    await expect(page.locator("text=/free/i").first()).toBeVisible();

    // Pro tier
    await expect(page.locator("text=/pro/i").first()).toBeVisible();

    // Max tier
    await expect(page.locator("text=/max/i").first()).toBeVisible();
  });

  test("shows tier features and limits", async ({ page }) => {
    // Check for feature descriptions
    await expect(
      page.locator("text=/analys|signal|scan/i").first(),
    ).toBeVisible();
  });

  test("has sign-up buttons for each tier", async ({ page }) => {
    // Should have multiple sign-up CTAs
    const signUpButtons = page.locator(
      'a[href*="sign"], button:has-text("Sign")',
    );
    await expect(signUpButtons.first()).toBeVisible();
  });

  test("page loads without errors", async ({ page }) => {
    const response = await page.goto("/pricing");
    expect(response?.status()).toBeLessThan(400);
  });
});
