import { test, expect } from "@playwright/test";

test.describe("Sign-In Page", () => {
  test("renders sign-in form with email and password fields", async ({
    page,
  }) => {
    await page.goto("/sign-in");

    // Email input
    await expect(
      page.locator('input[type="email"], input[name="email"]'),
    ).toBeVisible();

    // Password input
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // Submit button
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("shows link to sign-up page", async ({ page }) => {
    await page.goto("/sign-in");

    const signUpLink = page.locator('a[href*="sign-up"]');
    await expect(signUpLink).toBeVisible();
  });

  test("displays validation on empty submit", async ({ page }) => {
    await page.goto("/sign-in");

    // Try to submit empty form
    await page.locator('button[type="submit"]').click();

    // Should show validation error or stay on page
    await expect(page).toHaveURL(/sign-in/);
  });
});

test.describe("Sign-Up Page", () => {
  test("renders sign-up form", async ({ page }) => {
    await page.goto("/sign-up");

    // Email input
    await expect(
      page.locator('input[type="email"], input[name="email"]'),
    ).toBeVisible();

    // Password input
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("shows link to sign-in page", async ({ page }) => {
    await page.goto("/sign-up");

    const signInLink = page.locator('a[href*="sign-in"]');
    await expect(signInLink).toBeVisible();
  });
});
