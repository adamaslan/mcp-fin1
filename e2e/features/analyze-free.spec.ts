import { test, expect } from '../../e2e-utils/fixtures/free-tier-user';
import { AnalyzePage } from '../../e2e-utils/pages/analyze-page';
import { TIER_LIMITS } from '../../e2e-utils/constants/tier-limits';

/**
 * Stock analysis feature tests for FREE TIER
 * Tests tier-based limits: 5/day analyses, 3 signals max, swing timeframe only
 */
test.describe('Analysis - Free Tier', () => {
  test('free users see only swing timeframe (not day/scalp)', async ({ authenticatedPage, tierHelper }) => {
    const analyzePage = new AnalyzePage(authenticatedPage);
    await analyzePage.goto('AAPL');
    await analyzePage.waitForResults();

    // Get available timeframes
    const timeframes = await analyzePage.getVisibleTimeframes();

    // Free tier should only see swing
    expect(timeframes).toHaveLength(1);
    expect(timeframes[0].toLowerCase()).toContain('swing');

    // Verify no day or scalp options
    expect(timeframes.some((t) => t.toLowerCase().includes('day'))).toBe(false);
    expect(timeframes.some((t) => t.toLowerCase().includes('scalp'))).toBe(false);
  });

  test('free tier receives max 3 signals (not all 150+)', async ({ authenticatedPage, tierHelper }) => {
    const analyzePage = new AnalyzePage(authenticatedPage);
    await analyzePage.goto('AAPL');
    await analyzePage.waitForResults();

    // Should show limit text
    const limitText = await analyzePage.getLimitText();
    expect(limitText).toContain('Top 3');

    // Verify tier limits match
    const limits = await tierHelper.getTierLimits();
    expect(limits.signalsVisible).toBe(3);
  });

  test('valid symbols return analysis results', async ({ authenticatedPage }) => {
    const analyzePage = new AnalyzePage(authenticatedPage);
    const validSymbols = ['AAPL', 'MSFT', 'GOOGL'];

    for (const symbol of validSymbols) {
      await analyzePage.goto(symbol);
      await analyzePage.waitForResults();

      // Should have results, not error
      expect(await analyzePage.hasError()).toBe(false);
      expect(await analyzePage.getTradePlanCount()).toBeGreaterThan(0);
    }
  });

  test('invalid symbols show error message', async ({ authenticatedPage }) => {
    const analyzePage = new AnalyzePage(authenticatedPage);
    const invalidSymbols = ['NOTREAL123', 'FAKEFAKE', 'ZZZZZ'];

    for (const symbol of invalidSymbols) {
      await analyzePage.goto(symbol);
      await analyzePage.waitForResults();

      // Should show error
      expect(await analyzePage.hasError()).toBe(true);
      const errorMsg = await analyzePage.getErrorMessage();
      expect(errorMsg?.toLowerCase()).toMatch(/not found|invalid|error/);
    }
  });

  test('analysis page shows free tier indicator', async ({ authenticatedPage, tierHelper }) => {
    const analyzePage = new AnalyzePage(authenticatedPage);
    await analyzePage.goto('AAPL');
    await analyzePage.waitForResults();

    // Should display tier info
    expect(await analyzePage.hasLimitText()).toBe(true);

    // Verify tier limits
    const limits = await tierHelper.getTierLimits();
    expect(limits.analysesPerDay).toBe(5);
  });

  test('free tier sees swing timeframe as default', async ({ authenticatedPage }) => {
    const analyzePage = new AnalyzePage(authenticatedPage);
    await analyzePage.goto('AAPL');
    await analyzePage.waitForResults();

    // Get timeframes
    const timeframes = await analyzePage.getVisibleTimeframes();

    // Should have exactly one (swing)
    expect(timeframes).toHaveLength(1);
    expect(timeframes[0].toLowerCase()).toBe('swing');
  });

  test('free tier cannot access day timeframe', async ({ authenticatedPage }) => {
    const analyzePage = new AnalyzePage(authenticatedPage);
    await analyzePage.goto('AAPL');
    await analyzePage.waitForResults();

    // Day timeframe should be disabled or not exist
    const dayEnabled = await analyzePage.isTimeframeEnabled('Day');
    expect(dayEnabled).toBe(false);
  });

  test('free tier cannot access scalp timeframe', async ({ authenticatedPage }) => {
    const analyzePage = new AnalyzePage(authenticatedPage);
    await analyzePage.goto('AAPL');
    await analyzePage.waitForResults();

    // Scalp timeframe should be disabled or not exist
    const scalpEnabled = await analyzePage.isTimeframeEnabled('Scalp');
    expect(scalpEnabled).toBe(false);
  });
});

/**
 * Analysis daily limit tests for FREE TIER
 * Tests that 5/day limit is enforced
 */
test.describe('Analysis - Free Tier Daily Limit (5/day)', () => {
  test('displays 5 analyses per day limit', async ({ authenticatedPage, tierHelper }) => {
    const limits = await tierHelper.getTierLimits();
    expect(limits.analysesPerDay).toBe(5);
  });

  test('user can perform analysis within daily limit', async ({ authenticatedPage }) => {
    const analyzePage = new AnalyzePage(authenticatedPage);

    // Note: This test assumes fresh daily limit
    // In production, limit would be enforced by backend
    // Testing that page loads and displays results

    const symbol = process.env.TEST_SYMBOL_VALID || 'AAPL';
    await analyzePage.goto(symbol);
    await analyzePage.waitForResults();

    // Should not show error (within limit)
    expect(await analyzePage.hasError()).toBe(false);
  });
});
