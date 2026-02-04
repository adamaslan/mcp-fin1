import { test, expect } from "../fixtures/authenticated-user";

test.describe("Signals Page", () => {
  test("loads signals page", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/signals");

    await expect(
      authenticatedPage.locator("text=/signal/i").first(),
    ).toBeVisible();
  });
});
