import { test as authenticatedTest } from "./authenticated-user";
import { TierHelper } from "../helpers/tier-helper";

/**
 * Fixture for free tier user testing
 *
 * Extends authenticated fixture with tier verification:
 * - Ensures test user is on 'free' tier
 * - Throws error if tier is not free (prevents test data contamination)
 * - Provides TierHelper for tier-specific assertions
 *
 * Usage:
 *   import { test } from '../../e2e-utils/fixtures/free-tier-user';
 *
 *   test('free tier test', async ({ authenticatedPage, tierHelper }) => {
 *     // Automatically verified as free tier
 *     const limits = await tierHelper.getTierLimits();
 *     expect(limits.analysesPerDay).toBe(5);
 *   });
 */
export const test = authenticatedTest.extend<{
  tierHelper: TierHelper;
}>({
  tierHelper: async ({ authenticatedPage }, use) => {
    const helper = new TierHelper(authenticatedPage);

    // Verify user is on free tier
    await authenticatedPage.goto("/dashboard");

    const tier = await helper.getCurrentTier();

    if (tier !== "free") {
      throw new Error(
        `Expected free tier user, but got '${tier}' tier.\n` +
          `To fix this:\n` +
          `1. Go to Clerk Dashboard\n` +
          `2. Find the test user (${process.env.TEST_USER_EMAIL})\n` +
          `3. Edit public metadata and set: { "tier": "free" }\n` +
          `4. Re-run tests`,
      );
    }

    await use(helper);
  },
});

export { expect } from "@playwright/test";
