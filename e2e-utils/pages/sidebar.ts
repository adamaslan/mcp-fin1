import { Page, Locator } from '@playwright/test';
import { SELECTORS } from '../constants/selectors';

/**
 * Page Object Model for Sidebar navigation
 * Encapsulates all interactions with the sidebar
 */
export class Sidebar {
  readonly page: Page;
  readonly tierBadge: Locator;
  readonly dashboardLink: Locator;
  readonly analyzeLink: Locator;
  readonly scannerLink: Locator;
  readonly watchlistLink: Locator;
  readonly portfolioLink: Locator;
  readonly journalLink: Locator;
  readonly alertsLink: Locator;
  readonly calendarLink: Locator;
  readonly newsLink: Locator;
  readonly settingsLink: Locator;
  readonly learnLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.tierBadge = page.locator(SELECTORS.SIDEBAR.TIER_BADGE);
    this.dashboardLink = page.locator(SELECTORS.SIDEBAR.DASHBOARD_LINK);
    this.analyzeLink = page.locator(SELECTORS.SIDEBAR.ANALYZE_LINK);
    this.scannerLink = page.locator(SELECTORS.SIDEBAR.SCANNER_LINK);
    this.watchlistLink = page.locator(SELECTORS.SIDEBAR.WATCHLIST_LINK);
    this.portfolioLink = page.locator(SELECTORS.SIDEBAR.PORTFOLIO_LINK);
    this.journalLink = page.locator(SELECTORS.SIDEBAR.JOURNAL_LINK);
    this.alertsLink = page.locator(SELECTORS.SIDEBAR.ALERTS_LINK);
    this.calendarLink = page.locator('a:has-text("Calendar")');
    this.newsLink = page.locator('a:has-text("News")');
    this.settingsLink = page.locator('a:has-text("Settings")');
    this.learnLink = page.locator('a:has-text("Learn")');
  }

  /**
   * Get current user tier from badge
   */
  async getTier(): Promise<string> {
    const text = await this.tierBadge.textContent();
    const match = text?.match(/Tier: (\w+)/i);
    return match ? match[1].toLowerCase() : 'unknown';
  }

  /**
   * Check if a navigation link is locked (disabled appearance)
   */
  async isLinkLocked(linkName: string): Promise<boolean> {
    const link = this.page.locator(`a:has-text("${linkName}")`);

    try {
      const classes = await link.getAttribute('class');
      return classes?.includes('opacity-50') || false;
    } catch {
      return false;
    }
  }

  /**
   * Click on a navigation link
   */
  async clickLink(linkName: string): Promise<void> {
    await this.page.locator(`a:has-text("${linkName}")`).click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if a link has a lock icon (tier-gated feature indicator)
   */
  async hasLockIcon(linkName: string): Promise<boolean> {
    const link = this.page.locator(`a:has-text("${linkName}")`);
    const lockIcon = link.locator('svg, [class*="lock"]');

    try {
      return await lockIcon.isVisible({ timeout: 1000 });
    } catch {
      return false;
    }
  }

  /**
   * Get all visible navigation links
   */
  async getVisibleLinks(): Promise<string[]> {
    const links = await this.page.locator('aside a').all();
    const visibleLinks = [];

    for (const link of links) {
      const text = await link.textContent();
      if (text && (await link.isVisible())) {
        visibleLinks.push(text.trim());
      }
    }

    return visibleLinks;
  }

  /**
   * Check if tier badge is visible
   */
  async isTierBadgeVisible(): Promise<boolean> {
    try {
      return await this.tierBadge.isVisible({ timeout: 2000 });
    } catch {
      return false;
    }
  }

  /**
   * Click dashboard link
   */
  async clickDashboard(): Promise<void> {
    await this.dashboardLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click analyze link
   */
  async clickAnalyze(): Promise<void> {
    await this.analyzeLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click scanner link
   */
  async clickScanner(): Promise<void> {
    await this.scannerLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click watchlist link
   */
  async clickWatchlist(): Promise<void> {
    await this.watchlistLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click portfolio link (may be locked for free users)
   */
  async clickPortfolio(): Promise<void> {
    await this.portfolioLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click journal link (may be locked for free users)
   */
  async clickJournal(): Promise<void> {
    await this.journalLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click alerts link (may be locked for free/pro users)
   */
  async clickAlerts(): Promise<void> {
    await this.alertsLink.click();
    await this.page.waitForLoadState('networkidle');
  }
}
