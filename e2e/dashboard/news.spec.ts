import { test, expect } from "../fixtures/authenticated-user";

test.describe("News Page", () => {
  test("loads news page", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/news");

    await expect(
      authenticatedPage.locator("text=/news/i").first(),
    ).toBeVisible();
  });
});
