import { Page } from "@playwright/test";
import { SELECTORS } from "../constants/selectors";

/**
 * Helper class for Clerk authentication operations
 * Handles sign-in, sign-up, and sign-out flows
 */
export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Sign in with email and password
   * Handles Clerk authentication form and waits for dashboard redirect
   */
  async signIn(email: string, password: string): Promise<void> {
    await this.page.goto("/sign-in");

    // Wait for Clerk sign-in form to load
    await this.page.waitForSelector(SELECTORS.AUTH.EMAIL_INPUT, {
      timeout: 10000,
    });

    // Fill in credentials
    await this.page.fill(SELECTORS.AUTH.EMAIL_INPUT, email);
    await this.page.fill(SELECTORS.AUTH.PASSWORD_INPUT, password);

    // Submit form
    await this.page.click(SELECTORS.AUTH.SUBMIT_BUTTON);

    // Wait for redirect to dashboard
    await this.page.waitForURL("**/dashboard", { timeout: 15000 });

    // Verify authentication successful by waiting for dashboard header
    await this.page.waitForSelector(SELECTORS.DASHBOARD.HEADER, {
      timeout: 5000,
    });
  }

  /**
   * Sign up new user
   * Handles Clerk sign-up form and verifies redirect to dashboard
   */
  async signUp(email: string, password: string): Promise<void> {
    await this.page.goto("/sign-up");

    await this.page.waitForSelector(SELECTORS.AUTH.EMAIL_INPUT, {
      timeout: 10000,
    });

    // Fill in credentials
    await this.page.fill(SELECTORS.AUTH.EMAIL_INPUT, email);
    await this.page.fill(SELECTORS.AUTH.PASSWORD_INPUT, password);

    // Click sign up button
    await this.page.click(SELECTORS.AUTH.SUBMIT_BUTTON);

    // Wait for redirect to dashboard
    // (In test environment, email verification may be auto-approved)
    await this.page.waitForURL("**/dashboard", { timeout: 20000 });
  }

  /**
   * Sign out current user
   * Clicks user menu and sign out button
   */
  async signOut(): Promise<void> {
    await this.page.click(SELECTORS.HEADER.USER_MENU);
    await this.page.click(SELECTORS.HEADER.SIGN_OUT);

    // Wait for redirect to landing page
    await this.page.waitForURL("/", { timeout: 10000 });
  }

  /**
   * Check if user is currently authenticated
   * Returns true if dashboard header is visible, false otherwise
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.page.waitForSelector(SELECTORS.DASHBOARD.HEADER, {
        timeout: 3000,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Navigate to sign-in page and wait for it to load
   */
  async gotoSignIn(): Promise<void> {
    await this.page.goto("/sign-in");
    await this.page.waitForSelector(SELECTORS.AUTH.EMAIL_INPUT, {
      timeout: 10000,
    });
  }

  /**
   * Navigate to sign-up page and wait for it to load
   */
  async gotoSignUp(): Promise<void> {
    await this.page.goto("/sign-up");
    await this.page.waitForSelector(SELECTORS.AUTH.EMAIL_INPUT, {
      timeout: 10000,
    });
  }
}
