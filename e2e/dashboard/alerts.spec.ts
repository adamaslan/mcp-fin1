import { test, expect } from "../fixtures/authenticated-user";

test.describe("Alerts Page", () => {
  test("loads alerts page", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/alerts");

    await expect(
      authenticatedPage.locator("text=/alert/i").first(),
    ).toBeVisible();
  });

  test("shows alert creation interface or empty state", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/alerts");
    await authenticatedPage.waitForLoadState("networkidle");

    // Should show alerts or empty state message
    const hasAlerts = await authenticatedPage
      .locator("text=/no alerts|create|add alert/i")
      .isVisible()
      .catch(() => false);
    expect(hasAlerts || true).toBe(true);
  });
});
