import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders hero section with CTA", async ({ page }) => {
    // Hero section should be visible
    await expect(page.locator("main")).toBeVisible();

    // Check for sign-up CTA
    const signUpLink = page.locator('a[href="/sign-up"]');
    await expect(signUpLink.first()).toBeVisible();
  });

  test("displays live market pulse section", async ({ page }) => {
    // Market data section should load
    const marketSection = page.locator("text=/market|pulse|live/i").first();
    await expect(marketSection).toBeVisible({ timeout: 10000 });
  });

  test("shows Fibonacci preview section", async ({ page }) => {
    // Fibonacci section should be visible
    await expect(page.locator("text=/fibonacci/i").first()).toBeVisible();
  });

  test("displays sample trade plan", async ({ page }) => {
    // Trade plan preview section
    await expect(
      page.locator("text=/trade plan|analysis/i").first(),
    ).toBeVisible();
  });

  test("shows scanner preview with sample trades", async ({ page }) => {
    // Scanner preview section
    await expect(page.locator("text=/scanner|trades/i").first()).toBeVisible();
  });

  test("displays pricing cards with all tiers", async ({ page }) => {
    // Pricing section should show all tiers
    await expect(page.locator("text=/free/i").first()).toBeVisible();
    await expect(page.locator("text=/pro/i").first()).toBeVisible();
    await expect(page.locator("text=/max/i").first()).toBeVisible();
  });

  test("CTA section has working sign-up link", async ({ page }) => {
    // Find the "Get Started Free" CTA
    const ctaButton = page.locator('a[href="/sign-up"]').last();
    await expect(ctaButton).toBeVisible();

    // Click and verify navigation
    await ctaButton.click();
    await expect(page).toHaveURL(/sign-up/);
  });

  test("no console errors on page load", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForLoadState("networkidle");

    expect(errors).toHaveLength(0);
  });
});
