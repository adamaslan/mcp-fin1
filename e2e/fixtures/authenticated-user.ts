import { test as base, expect, Page } from "@playwright/test";

interface AuthenticatedFixtures {
  authenticatedPage: Page;
  tierHelper: TierHelper;
}

class TierHelper {
  constructor(private page: Page) {}

  async getTierLimits() {
    // Get tier limits from API or page state
    return {
      analysesPerDay: 5,
      scansPerDay: 1,
      signalsVisible: 3,
    };
  }
}

export const test = base.extend<AuthenticatedFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Set up authentication
    // Option 1: Use saved auth state
    // Option 2: Use test credentials

    // For CI, use environment variables
    const email = process.env.TEST_USER_EMAIL;
    const password = process.env.TEST_USER_PASSWORD;

    if (email && password) {
      await page.goto("/sign-in");
      await page.fill('input[type="email"]', email);
      await page.fill('input[type="password"]', password);
      await page.click('button[type="submit"]');

      // Wait for redirect to dashboard
      await page.waitForURL(/dashboard/, { timeout: 15000 });
    } else {
      // Use stored auth state for local development
      // await page.context().addCookies([...]);
    }

    await use(page);
  },

  tierHelper: async ({ authenticatedPage }, use) => {
    await use(new TierHelper(authenticatedPage));
  },
});

export { expect };
