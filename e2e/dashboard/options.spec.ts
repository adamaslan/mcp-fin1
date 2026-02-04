import { test, expect } from "../fixtures/authenticated-user";

test.describe("Options Page", () => {
  test("loads options page", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/options");

    await expect(
      authenticatedPage.locator("text=/option/i").first(),
    ).toBeVisible();
  });
});
