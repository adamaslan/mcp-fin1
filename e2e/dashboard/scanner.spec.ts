import { test, expect } from "../fixtures/authenticated-user";

test.describe("Scanner Page", () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/scanner");
  });

  test("displays scanner controls", async ({ authenticatedPage }) => {
    // Title
    await expect(
      authenticatedPage.locator("text=/trade scanner/i"),
    ).toBeVisible();

    // Universe selector
    await expect(authenticatedPage.locator("text=/universe/i")).toBeVisible();

    // Scan button
    await expect(
      authenticatedPage.locator("button:has-text('Scan')"),
    ).toBeVisible();
  });

  test("shows universe dropdown with options", async ({
    authenticatedPage,
  }) => {
    // Click the select trigger
    const selectTrigger = authenticatedPage
      .locator('[role="combobox"]')
      .first();
    await selectTrigger.click();

    // Should show S&P 500 option
    await expect(
      authenticatedPage.locator("text=/S&P 500|sp500/i"),
    ).toBeVisible();
  });

  test("displays AI toggle (tier-gated)", async ({ authenticatedPage }) => {
    await expect(
      authenticatedPage.locator("text=/AI Insights/i"),
    ).toBeVisible();
  });

  test("scan button triggers scan and shows results", async ({
    authenticatedPage,
  }) => {
    // Click scan button
    await authenticatedPage.locator("button:has-text('Scan')").click();

    // Wait for loading to complete
    await authenticatedPage
      .waitForSelector('[class*="animate-spin"]', {
        state: "detached",
        timeout: 30000,
      })
      .catch(() => {}); // May already be done

    // Should show results or "no trades found" message
    await expect(
      authenticatedPage.locator("text=/results|qualified|no.*found/i").first(),
    ).toBeVisible({ timeout: 30000 });
  });

  test("results table displays correct columns", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.locator("button:has-text('Scan')").click();

    // Wait for results
    await authenticatedPage.waitForLoadState("networkidle");

    // If results exist, check table headers
    const tableExists = await authenticatedPage
      .locator("table")
      .isVisible()
      .catch(() => false);

    if (tableExists) {
      await expect(authenticatedPage.locator("text=/Symbol/i")).toBeVisible();
      await expect(authenticatedPage.locator("text=/Entry/i")).toBeVisible();
      await expect(authenticatedPage.locator("text=/Stop/i")).toBeVisible();
      await expect(authenticatedPage.locator("text=/Target/i")).toBeVisible();
    }
  });
});
