import { test, expect } from "@playwright/test";

/**
 * Phase 5: Landing Page Tests
 * Tests public access to landing page (no authentication required)
 */

test.describe("Phase 5: Landing Page", () => {
  test("should load landing page without authentication", async ({ page }) => {
    await page.goto("/");

    // Page should load successfully
    await expect(page.locator("body")).toBeVisible();

    // Check for main heading
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible();
  });

  test("should display latest analysis section", async ({ page }) => {
    await page.goto("/");

    // Look for latest runs/analysis section
    const pageContent = await page.textContent("body");
    expect(pageContent?.toLowerCase()).toContain("analysis");
  });

  test("should load in under 2 seconds", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/", { waitUntil: "domcontentloaded" });

    const loadTime = Date.now() - startTime;

    // Landing page should be cached and fast
    expect(loadTime).toBeLessThan(2000);
  });

  test("should be responsive on mobile (375px)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/");

    // Check no horizontal scrollbar
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(376);
  });

  test("should have no critical console errors", async ({ page }) => {
    const errors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/");

    // No critical errors expected
    expect(errors).toHaveLength(0);
  });
});
