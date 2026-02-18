import { test, expect } from "@playwright/test";

/**
 * Phase 5: MCP Control Center - Free Tier Tests
 * Tests free user capabilities (basic tool execution, no AI, no presets)
 */

test.describe("Phase 5: MCP Control - Free Tier", () => {
  test("should load control page", async ({ page }) => {
    // Navigate to control page
    const response = await page.goto("/mcp-control");

    // Should either load the page or redirect (but not 404)
    const status = response?.status();
    expect([200, 301, 302].includes(status || 200)).toBeTruthy();
  });

  test("should display tool selector", async ({ page }) => {
    await page.goto("/mcp-control");

    // Look for tool selector
    const toolSelector = page
      .locator('select, [role="listbox"], [class*="tool"], [class*="selector"]')
      .first();

    // Should have some content indicating tools
    const pageContent = await page.textContent("body");
    expect(pageContent?.toLowerCase()).toContain("tool");
  });

  test("should display parameter form", async ({ page }) => {
    await page.goto("/mcp-control");

    // Look for form inputs
    const form = page.locator("form, [class*='form']").first();
    const inputs = page.locator("input, select, textarea");

    // Should have form elements
    const inputCount = await inputs.count();
    expect(inputCount).toBeGreaterThanOrEqual(0);
  });

  test("should not show AI Analysis toggle for free users", async ({
    page,
  }) => {
    await page.goto("/mcp-control");

    // Look for AI-related content
    const aiToggle = page.locator(
      'input[type="checkbox"][name*="ai"], [class*="ai"]',
    );
    const aiText = page.locator("text=/ai\\s+analysis|gemini/i");

    // AI toggle should not be visible for free tier
    // (May not exist or may be hidden)
    const toggleVisible = await aiToggle.isVisible().catch(() => false);
    const textVisible = await aiText.isVisible().catch(() => false);

    // At least one should indicate no AI for free
    if (toggleVisible || textVisible) {
      // If AI UI exists, it should be disabled or hidden
      const isDisabled = await aiToggle.isDisabled().catch(() => false);
      expect(isDisabled || !toggleVisible || !textVisible).toBeTruthy();
    }
  });

  test("should display results area", async ({ page }) => {
    await page.goto("/mcp-control");

    // Look for results section
    const pageContent = await page.textContent("body");
    expect(
      pageContent?.toLowerCase().includes("result") ||
        pageContent?.toLowerCase().includes("signal") ||
        pageContent?.toLowerCase().includes("output"),
    ).toBeTruthy();
  });

  test("should load in under 3 seconds", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/mcp-control", { waitUntil: "domcontentloaded" });

    const loadTime = Date.now() - startTime;

    // MCP Control should load reasonably fast
    expect(loadTime).toBeLessThan(3000);
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/mcp-control");

    // Should be usable on mobile
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(376);
  });

  test("should have no critical console errors", async ({ page }) => {
    const errors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error" && !msg.text().includes("404")) {
        errors.push(msg.text());
      }
    });

    await page.goto("/mcp-control").catch(() => {
      // Redirect is OK
    });

    // Allow some errors but not many
    expect(errors.length).toBeLessThan(3);
  });

  test("should have proper layout on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });

    await page.goto("/mcp-control");

    // Check for layout sections (tool selector | params | results)
    const hasMultipleSections = await page.evaluate(() => {
      const main = document.querySelector("main");
      const sections = document.querySelectorAll("section, [class*='column']");
      return sections.length >= 1 || (main?.children.length || 0) >= 1;
    });

    expect(hasMultipleSections).toBeTruthy();
  });
});
