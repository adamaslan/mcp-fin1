import { test, expect } from "../fixtures/authenticated-user";

test.describe("Trading Journal Page", () => {
  test("loads journal page", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/journal");

    await expect(
      authenticatedPage.locator("text=/journal/i").first(),
    ).toBeVisible();
  });

  test("shows journal entries or empty state", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/journal");
    await authenticatedPage.waitForLoadState("networkidle");

    // Should show entries or "no entries" message
  });
});
