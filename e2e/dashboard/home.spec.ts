import { test, expect } from '../../e2e-utils/fixtures/free-tier-user';
import { DashboardPage } from '../../e2e-utils/pages/dashboard-page';
import { Sidebar } from '../../e2e-utils/pages/sidebar';

/**
 * Dashboard home page tests
 * Tests that free tier users see dashboard correctly
 */
test.describe('Dashboard - Home Page', () => {
  test('dashboard loads for authenticated free user', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.goto();

    // Verify welcome message
    expect(await dashboard.isVisible()).toBe(true);
    const message = await dashboard.getWelcomeMessage();
    expect(message).toContain('Welcome back');
  });

  test('dashboard displays all quick action cards', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.goto();

    // Verify all quick action cards are visible
    expect(await dashboard.haveQuickActionCards()).toBe(true);
  });

  test('getting started section is visible', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.goto();

    // Verify getting started guide section
    expect(await dashboard.hasGettingStartedSection()).toBe(true);
  });

  test('quick action card links navigate correctly', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.goto();

    // Test Analyze card
    await dashboard.clickAnalyze();
    expect(authenticatedPage.url()).toContain('/analyze/');

    // Back to dashboard
    await dashboard.goto();

    // Test Scanner card
    await dashboard.clickScanner();
    expect(authenticatedPage.url()).toContain('/scanner');

    // Back to dashboard
    await dashboard.goto();

    // Test Learn card
    await dashboard.clickLearn();
    expect(authenticatedPage.url()).toContain('/learn/signals');
  });
});

/**
 * Dashboard navigation sidebar tests
 * Tests that free tier navigation is correct
 */
test.describe('Dashboard - Sidebar Navigation', () => {
  test('sidebar displays free tier badge', async ({ authenticatedPage, tierHelper }) => {
    const sidebar = new Sidebar(authenticatedPage);
    await authenticatedPage.goto('/dashboard');

    // Verify tier badge
    expect(await sidebar.isTierBadgeVisible()).toBe(true);
    const tier = await sidebar.getTier();
    expect(tier).toBe('free');
  });

  test('free tier sees accessible features unlocked', async ({ authenticatedPage }) => {
    const sidebar = new Sidebar(authenticatedPage);
    await authenticatedPage.goto('/dashboard');

    // These should be accessible for free tier
    const freeAccessibleFeatures = [
      'Dashboard',
      'Analyze',
      'Scanner',
      'Watchlist',
      'Calendar',
      'News',
      'Settings',
      'Learn',
    ];

    for (const feature of freeAccessibleFeatures) {
      const isLocked = await sidebar.isLinkLocked(feature);
      expect(isLocked).toBe(false);
    }
  });

  test('free tier sees pro features locked', async ({ authenticatedPage }) => {
    const sidebar = new Sidebar(authenticatedPage);
    await authenticatedPage.goto('/dashboard');

    // These should be locked for free tier
    const proOnlyFeatures = ['Portfolio', 'Journal'];

    for (const feature of proOnlyFeatures) {
      const isLocked = await sidebar.isLinkLocked(feature);
      expect(isLocked).toBe(true);
    }
  });

  test('free tier sees max features locked', async ({ authenticatedPage }) => {
    const sidebar = new Sidebar(authenticatedPage);
    await authenticatedPage.goto('/dashboard');

    // These should be locked for free tier
    const maxOnlyFeatures = ['Alerts'];

    for (const feature of maxOnlyFeatures) {
      const isLocked = await sidebar.isLinkLocked(feature);
      expect(isLocked).toBe(true);
    }
  });

  test('sidebar navigation links work', async ({ authenticatedPage }) => {
    const sidebar = new Sidebar(authenticatedPage);
    await authenticatedPage.goto('/dashboard');

    // Test navigation to analyzer
    await sidebar.clickAnalyze();
    expect(authenticatedPage.url()).toContain('/analyze/');

    // Test navigation to scanner
    await sidebar.clickScanner();
    expect(authenticatedPage.url()).toContain('/scanner');

    // Test navigation to watchlist
    await sidebar.clickWatchlist();
    expect(authenticatedPage.url()).toContain('/watchlist');
  });
});
