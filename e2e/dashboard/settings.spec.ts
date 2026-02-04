import { test, expect } from "../fixtures/authenticated-user";

test.describe("Settings Page", () => {
  test("loads settings page", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/settings");

    await expect(
      authenticatedPage.locator("text=/setting/i").first(),
    ).toBeVisible();
  });

  test("displays user preferences", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/settings");

    // Should show some settings options
    await expect(
      authenticatedPage
        .locator("text=/preference|notification|theme/i")
        .first(),
    ).toBeVisible();
  });
});
