import { test, expect } from "../fixtures/authenticated-user";

test.describe("Portfolio Page", () => {
  test("loads portfolio page", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/portfolio");

    // Page should load
    await expect(authenticatedPage.locator("body")).toBeVisible();
  });

  test("displays portfolio header", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/portfolio");

    await expect(
      authenticatedPage.locator("text=/portfolio/i").first(),
    ).toBeVisible();
  });

  test("shows tier-gated message or portfolio content", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/portfolio");
    await authenticatedPage.waitForLoadState("networkidle");

    // Either shows portfolio content or upgrade prompt
    const hasContent = await authenticatedPage
      .locator("text=/position|holding|risk/i")
      .isVisible()
      .catch(() => false);
    const hasUpgradePrompt = await authenticatedPage
      .locator("text=/upgrade|pro|locked/i")
      .isVisible()
      .catch(() => false);

    expect(hasContent || hasUpgradePrompt).toBe(true);
  });
});
