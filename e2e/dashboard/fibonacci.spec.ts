import { test, expect } from "../fixtures/authenticated-user";

test.describe("Fibonacci Page", () => {
  test("loads fibonacci page", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/fibonacci");

    await expect(
      authenticatedPage.locator("text=/fibonacci/i").first(),
    ).toBeVisible();
  });

  test("shows fibonacci level inputs or calculator", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/fibonacci");

    // Should have inputs for high/low prices
    await expect(authenticatedPage.locator("input").first()).toBeVisible();
  });
});
