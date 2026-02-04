import { test, expect } from "../fixtures/authenticated-user";

test.describe("Export Page", () => {
  test("loads export page", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/export");

    await expect(
      authenticatedPage.locator("text=/export/i").first(),
    ).toBeVisible();
  });
});
