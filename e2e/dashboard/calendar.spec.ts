import { test, expect } from "../fixtures/authenticated-user";

test.describe("Calendar Page", () => {
  test("loads calendar page", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/calendar");

    await expect(
      authenticatedPage.locator("text=/calendar|earnings|economic/i").first(),
    ).toBeVisible();
  });
});
