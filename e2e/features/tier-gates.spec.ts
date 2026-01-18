import { test, expect } from '../../e2e-utils/fixtures/free-tier-user';
import { Sidebar } from '../../e2e-utils/pages/sidebar';

/**
 * Tier gating tests for FREE TIER
 * Tests that locked features show upgrade prompts
 */
test.describe('Tier Gates - Free Tier', () => {
  test('portfolio link shows lock icon for free users', async ({ authenticatedPage }) => {
    const sidebar = new Sidebar(authenticatedPage);
    await authenticatedPage.goto('/dashboard');

    // Portfolio should be locked
    const isLocked = await sidebar.isLinkLocked('Portfolio');
    expect(isLocked).toBe(true);

    // Should have lock icon
    const hasLock = await sidebar.hasLockIcon('Portfolio');
    expect(hasLock).toBe(true);
  });

  test('journal link shows lock icon for free users', async ({ authenticatedPage }) => {
    const sidebar = new Sidebar(authenticatedPage);
    await authenticatedPage.goto('/dashboard');

    // Journal should be locked
    const isLocked = await sidebar.isLinkLocked('Journal');
    expect(isLocked).toBe(true);

    // Should have lock icon
    const hasLock = await sidebar.hasLockIcon('Journal');
    expect(hasLock).toBe(true);
  });

  test('alerts link shows lock icon for free users', async ({ authenticatedPage }) => {
    const sidebar = new Sidebar(authenticatedPage);
    await authenticatedPage.goto('/dashboard');

    // Alerts should be locked (max only)
    const isLocked = await sidebar.isLinkLocked('Alerts');
    expect(isLocked).toBe(true);

    // Should have lock icon
    const hasLock = await sidebar.hasLockIcon('Alerts');
    expect(hasLock).toBe(true);
  });

  test('clicking locked portfolio shows upgrade prompt', async ({ authenticatedPage, page }) => {
    const sidebar = new Sidebar(authenticatedPage);
    await authenticatedPage.goto('/dashboard');

    // Try to click portfolio
    await sidebar.clickPortfolio();

    // Should show upgrade prompt (implementation may vary)
    // Could be modal, blurred page, or redirect to pricing
    const upgradeMentioned = page.locator('text=/upgrade|pro|premium/i');
    const isPricingPage = authenticatedPage.url().includes('/pricing');

    // One of these should be true
    const hasUpgradeIndicator = await upgradeMentioned.isVisible().catch(() => false);
    expect(hasUpgradeIndicator || isPricingPage).toBe(true);
  });

  test('clicking locked journal shows upgrade prompt', async ({ authenticatedPage, page }) => {
    const sidebar = new Sidebar(authenticatedPage);
    await authenticatedPage.goto('/dashboard');

    // Try to click journal
    await sidebar.clickJournal();

    // Should show upgrade prompt
    const upgradeMentioned = page.locator('text=/upgrade|pro|premium/i');
    const isPricingPage = authenticatedPage.url().includes('/pricing');

    const hasUpgradeIndicator = await upgradeMentioned.isVisible().catch(() => false);
    expect(hasUpgradeIndicator || isPricingPage).toBe(true);
  });

  test('clicking locked alerts shows upgrade prompt', async ({ authenticatedPage, page }) => {
    const sidebar = new Sidebar(authenticatedPage);
    await authenticatedPage.goto('/dashboard');

    // Try to click alerts
    await sidebar.clickAlerts();

    // Should show upgrade prompt
    const upgradeMentioned = page.locator('text=/upgrade|max|premium/i');
    const isPricingPage = authenticatedPage.url().includes('/pricing');

    const hasUpgradeIndicator = await upgradeMentioned.isVisible().catch(() => false);
    expect(hasUpgradeIndicator || isPricingPage).toBe(true);
  });

  test('free tier sees correct tier-locked features', async ({ authenticatedPage, tierHelper }) => {
    // Free tier locked features summary
    const isPortfolioLocked = await tierHelper.isFeatureLocked('Portfolio');
    const isJournalLocked = await tierHelper.isFeatureLocked('Journal');
    const isAlertsLocked = await tierHelper.isFeatureLocked('Alerts');

    expect(isPortfolioLocked).toBe(true);
    expect(isJournalLocked).toBe(true);
    expect(isAlertsLocked).toBe(true);
  });

  test('free tier accessible features are not locked', async ({ authenticatedPage, tierHelper }) => {
    const accessibleFeatures = ['Dashboard', 'Analyze', 'Scanner', 'Watchlist', 'Learn'];

    for (const feature of accessibleFeatures) {
      const isLocked = await tierHelper.isFeatureLocked(feature);
      expect(isLocked).toBe(false);
    }
  });
});

/**
 * Pro-only features tests for FREE TIER
 * Tests that pro features show appropriate upgrade messaging
 */
test.describe('Tier Gates - Pro Features (Free Tier)', () => {
  test('portfolio is pro-only feature', async ({ authenticatedPage, tierHelper }) => {
    const isLocked = await tierHelper.isFeatureLocked('Portfolio');
    expect(isLocked).toBe(true);
  });

  test('journal is pro-only feature', async ({ authenticatedPage, tierHelper }) => {
    const isLocked = await tierHelper.isFeatureLocked('Journal');
    expect(isLocked).toBe(true);
  });

  test('portfolio requires pro tier upgrade', async ({ authenticatedPage, tierHelper }) => {
    const tier = await tierHelper.getCurrentTier();
    expect(tier).toBe('free');

    // Portfolio should be locked
    const isLocked = await tierHelper.isFeatureLocked('Portfolio');
    expect(isLocked).toBe(true);
  });

  test('journal requires pro tier upgrade', async ({ authenticatedPage, tierHelper }) => {
    const tier = await tierHelper.getCurrentTier();
    expect(tier).toBe('free');

    // Journal should be locked
    const isLocked = await tierHelper.isFeatureLocked('Journal');
    expect(isLocked).toBe(true);
  });
});

/**
 * Max-only features tests for FREE TIER
 * Tests that max features are locked with upgrade messaging
 */
test.describe('Tier Gates - Max Features (Free Tier)', () => {
  test('alerts is max-only feature', async ({ authenticatedPage, tierHelper }) => {
    const isLocked = await tierHelper.isFeatureLocked('Alerts');
    expect(isLocked).toBe(true);
  });

  test('alerts requires max tier upgrade', async ({ authenticatedPage, tierHelper }) => {
    const tier = await tierHelper.getCurrentTier();
    expect(tier).toBe('free');

    // Alerts should be locked
    const isLocked = await tierHelper.isFeatureLocked('Alerts');
    expect(isLocked).toBe(true);
  });

  test('export is max-only feature', async ({ authenticatedPage }) => {
    const sidebar = new Sidebar(authenticatedPage);
    await authenticatedPage.goto('/dashboard');

    // Export link should be locked
    const isLocked = await sidebar.isLinkLocked('Export');
    expect(isLocked).toBe(true);
  });

  test('signals is max-only feature', async ({ authenticatedPage }) => {
    const sidebar = new Sidebar(authenticatedPage);
    await authenticatedPage.goto('/dashboard');

    // Signals link should be locked
    const isLocked = await sidebar.isLinkLocked('Signals');
    expect(isLocked).toBe(true);
  });
});
