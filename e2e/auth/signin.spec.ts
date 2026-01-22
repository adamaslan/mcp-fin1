import { test, expect } from "../../e2e-utils/fixtures/authenticated-user";
import { AuthHelper } from "../../e2e-utils/helpers/auth-helper";

/**
 * Authentication tests for sign-in flow
 * Tests Clerk authentication and session persistence
 */
test.describe("Authentication - Sign In", () => {
  test("user can sign in with valid credentials", async ({
    page,
    authHelper,
  }) => {
    // Navigate to sign-in page
    await authHelper.gotoSignIn();

    // Verify sign-in form is visible
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // Sign in
    await authHelper.signIn(
      process.env.TEST_USER_EMAIL!,
      process.env.TEST_USER_PASSWORD!,
    );

    // Verify redirected to dashboard
    expect(page.url()).toContain("/dashboard");
    await expect(page.locator('h1:has-text("Welcome back")')).toBeVisible();
  });

  test("session persists across page reloads", async ({
    authenticatedPage,
  }) => {
    // Navigate to dashboard
    await authenticatedPage.goto("/dashboard");

    // Verify authenticated
    await expect(
      authenticatedPage.locator('h1:has-text("Welcome back")'),
    ).toBeVisible();

    // Reload page
    await authenticatedPage.reload();

    // Verify still authenticated (session persisted)
    await expect(
      authenticatedPage.locator('h1:has-text("Welcome back")'),
    ).toBeVisible();
  });

  test("authenticated user can access protected routes", async ({
    authenticatedPage,
  }) => {
    // Try accessing protected routes
    const protectedRoutes = [
      "/alerts",
      "/scanner",
      "/analyze/AAPL",
      "/watchlist",
    ];

    for (const route of protectedRoutes) {
      await authenticatedPage.goto(route);
      // Should not redirect to sign-in
      expect(authenticatedPage.url()).not.toContain("/sign-in");
    }
  });

  test("user button shows in header after sign-in", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/dashboard");

    // Verify user button/menu is visible
    const userMenu = authenticatedPage.locator(
      '[data-testid="user-menu"], button:has-text("Sign out")',
    );
    await expect(userMenu).toBeVisible();
  });
});
