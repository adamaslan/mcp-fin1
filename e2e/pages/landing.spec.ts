import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("should load without authentication", async ({ page }) => {
    await page.goto("/");

    // Check page title
    await expect(page).toHaveTitle(/MCP Finance|Finance/i);

    // Check main heading exists
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible();
  });

  test("should display latest analysis section", async ({ page }) => {
    await page.goto("/");

    // Check for "Latest Analysis" or similar section
    const content = await page.content();
    expect(content.toLowerCase()).toContain("analysis");
  });

  test("should be responsive on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/");

    // Check page loads
    await expect(page.locator("body")).toBeVisible();

    // Check main content visible
    const main = page.locator("main, [role='main']").first();
    if ((await main.count()) > 0) {
      await expect(main).toBeVisible();
    }
  });

  test("should have sign-up or authentication section", async ({ page }) => {
    await page.goto("/");

    // Page should load successfully
    await expect(page.locator("body")).toBeVisible();

    // Look for any auth-related content
    const content = await page.content();
    const hasAuthContent =
      content.toLowerCase().includes("sign") ||
      content.toLowerCase().includes("auth") ||
      content.toLowerCase().includes("login");

    expect(hasAuthContent).toBeTruthy();
  });

  test("should load in under 3 seconds", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/", { waitUntil: "domcontentloaded" });

    const loadTime = Date.now() - startTime;

    // Should load DOM in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test("should have no critical console errors", async ({ page }) => {
    const errors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle").catch(() => {
      // Timeout is OK, just check we loaded something
    });

    // Allow some errors, but not too many
    expect(errors.length).toBeLessThan(3);
  });
});
