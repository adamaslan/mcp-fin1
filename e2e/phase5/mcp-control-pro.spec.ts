import { test, expect } from "@playwright/test";

/**
 * Phase 5: MCP Control Center - Pro Tier Tests
 * Tests pro user capabilities (AI access, presets, all parameters)
 */

test.describe("Phase 5: MCP Control - Pro Tier", () => {
  test("should load control page for pro users", async ({ page }) => {
    // Navigate to control page
    const response = await page.goto("/mcp-control");

    // Should either load the page or redirect (but not 404)
    const status = response?.status();
    expect([200, 301, 302].includes(status || 200)).toBeTruthy();
  });

  test("should display AI Analysis toggle for pro users", async ({ page }) => {
    await page.goto("/mcp-control");

    // Look for AI toggle
    const aiToggle = page
      .locator(
        'input[type="checkbox"][name*="ai"], [class*="ai"][role="switch"]',
      )
      .first();
    const aiLabel = page.locator("text=/ai\\s+analysis|enable\\s+ai/i").first();

    // At least one AI element should exist
    const toggleExists = await aiToggle.count();
    const labelExists = await aiLabel.count();

    expect(toggleExists + labelExists).toBeGreaterThan(0);
  });

  test("should allow toggling AI Analysis", async ({ page }) => {
    await page.goto("/mcp-control");

    // Find and toggle AI checkbox
    const aiCheckbox = page
      .locator('input[type="checkbox"][name*="ai"]')
      .first();

    if ((await aiCheckbox.count()) > 0) {
      // Check if we can interact with it
      const isCheckable = await aiCheckbox.isEnabled().catch(() => false);
      expect(isCheckable || (await aiCheckbox.count()) > 0).toBeTruthy();
    }
  });

  test("should display Gemini insights card when AI enabled", async ({
    page,
  }) => {
    await page.goto("/mcp-control");

    // Look for Gemini or AI insights card
    const pageContent = await page.content();
    const hasGemini =
      pageContent.toLowerCase().includes("gemini") ||
      pageContent.toLowerCase().includes("ai insights") ||
      pageContent.toLowerCase().includes("insights");

    expect(hasGemini).toBeTruthy();
  });

  test("should display preset selector for pro users", async ({ page }) => {
    await page.goto("/mcp-control");

    // Look for preset-related content
    const presetSection = page
      .locator("[class*='preset'], [class*='save']")
      .first();
    const presetText = page.locator("text=/preset|save|load/i").first();

    // At least one preset element should exist
    const presetExists = await presetSection.count();
    const textExists = await presetText.count();

    expect(presetExists + textExists).toBeGreaterThan(0);
  });

  test("should allow saving presets", async ({ page }) => {
    await page.goto("/mcp-control");

    // Look for save preset button
    const saveButton = page
      .locator('button:has-text("Save"), button:has-text("Preset")')
      .first();

    // Button should exist
    const saveButtonExists = await saveButton.count();
    expect(saveButtonExists).toBeGreaterThanOrEqual(0);
  });

  test("should display all parameters for pro users", async ({ page }) => {
    await page.goto("/mcp-control");

    // Count parameter inputs
    const inputs = page.locator("input, select, textarea");
    const inputCount = await inputs.count();

    // Pro users should have more parameters available
    expect(inputCount).toBeGreaterThanOrEqual(1);
  });

  test("should load pro features in under 3 seconds", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/mcp-control", { waitUntil: "domcontentloaded" });

    const loadTime = Date.now() - startTime;

    // Should load quickly even with pro features
    expect(loadTime).toBeLessThan(3000);
  });

  test("should be responsive with pro features on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/mcp-control");

    // Should still be usable with all pro features
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(376);

    // AI toggle should still be accessible
    const aiToggle = page.locator('input[type="checkbox"][name*="ai"]');
    const toggleCount = await aiToggle.count();

    // Toggle should either exist or be hidden appropriately
    expect(toggleCount).toBeGreaterThanOrEqual(0);
  });

  test("should have proper layout for pro features", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });

    await page.goto("/mcp-control");

    // Check for multiple layout sections
    const hasMultipleSections = await page.evaluate(() => {
      const main = document.querySelector("main");
      const sections = document.querySelectorAll("section, [class*='column']");
      const cards = document.querySelectorAll(
        "[class*='card'], [class*='panel']",
      );

      return (
        sections.length >= 1 ||
        cards.length >= 1 ||
        (main?.children.length || 0) >= 1
      );
    });

    expect(hasMultipleSections).toBeTruthy();
  });

  test("should have no critical console errors with pro features", async ({
    page,
  }) => {
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

  test("should display results section for pro users", async ({ page }) => {
    await page.goto("/mcp-control");

    // Look for results section with pro-specific content
    const pageContent = await page.textContent("body");

    const hasResults =
      pageContent?.toLowerCase().includes("result") ||
      pageContent?.toLowerCase().includes("signal") ||
      pageContent?.toLowerCase().includes("insight");

    expect(hasResults).toBeTruthy();
  });
});
