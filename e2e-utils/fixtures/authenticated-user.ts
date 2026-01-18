import { test as base, Page } from '@playwright/test';
import { AuthHelper } from '../helpers/auth-helper';
import fs from 'fs';
import path from 'path';

const STORAGE_STATE_PATH = process.env.STORAGE_STATE || '.auth/user.json';

/**
 * Extended test fixture with authenticated user
 *
 * This fixture handles:
 * - Initial authentication and session storage on first run
 * - Session reuse across tests for performance (from .auth/user.json)
 * - Automatic logout after each test
 *
 * Usage:
 *   import { test } from '../../e2e-utils/fixtures/authenticated-user';
 *
 *   test('my test', async ({ authenticatedPage, authHelper }) => {
 *     // Page is already authenticated
 *     await authenticatedPage.goto('/dashboard');
 *   });
 */
export const test = base.extend<{
  authenticatedPage: Page;
  authHelper: AuthHelper;
}>({
  authenticatedPage: async ({ browser }, use) => {
    let context;

    // Check if we have stored authentication state
    if (fs.existsSync(STORAGE_STATE_PATH)) {
      // Reuse existing session (fast path)
      context = await browser.newContext({
        storageState: STORAGE_STATE_PATH,
      });
    } else {
      // Create new session and authenticate (first run)
      context = await browser.newContext();
      const page = await context.newPage();

      const authHelper = new AuthHelper(page);

      // Sign in with test user
      const testEmail = process.env.TEST_USER_EMAIL;
      const testPassword = process.env.TEST_USER_PASSWORD;

      if (!testEmail || !testPassword) {
        throw new Error('TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables are required');
      }

      try {
        await authHelper.signIn(testEmail, testPassword);
      } catch (error) {
        throw new Error(
          `Failed to authenticate test user. Ensure:\n` +
          `1. TEST_USER_EMAIL and TEST_USER_PASSWORD are set in .env.test\n` +
          `2. Test user exists in Clerk Dashboard\n` +
          `3. Test user has 'free' tier set in public metadata\n` +
          `Error: ${error}`,
        );
      }

      // Ensure .auth directory exists
      const authDir = path.dirname(STORAGE_STATE_PATH);
      if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
      }

      // Save authentication state for reuse
      await context.storageState({ path: STORAGE_STATE_PATH });

      await page.close();
    }

    const page = await context.newPage();

    await use(page);

    await context.close();
  },

  authHelper: async ({ authenticatedPage }, use) => {
    const helper = new AuthHelper(authenticatedPage);
    await use(helper);
  },
});

export { expect } from '@playwright/test';
