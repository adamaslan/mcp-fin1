import { test, expect } from "../fixtures/authenticated-user";

test.describe("Compare Page", () => {
  test("loads compare page", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/compare");

    await expect(
      authenticatedPage.locator("text=/compare/i").first(),
    ).toBeVisible();
  });

  test("shows symbol input fields", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/compare");

    // Should have input for symbols to compare
    await expect(authenticatedPage.locator("input").first()).toBeVisible();
  });
});
