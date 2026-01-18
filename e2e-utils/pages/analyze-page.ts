import { Page, Locator } from '@playwright/test';
import { SELECTORS } from '../constants/selectors';

/**
 * Page Object Model for Analysis feature page
 * Encapsulates all interactions with stock analysis feature
 */
export class AnalyzePage {
  readonly page: Page;
  readonly symbolInput: Locator;
  readonly searchButton: Locator;
  readonly tradePlanCards: Locator;
  readonly timeframeSelector: Locator;
  readonly errorMessage: Locator;
  readonly limitText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.symbolInput = page.locator(SELECTORS.ANALYZE.SYMBOL_INPUT);
    this.searchButton = page.locator(SELECTORS.ANALYZE.SEARCH_BUTTON);
    this.tradePlanCards = page.locator(SELECTORS.ANALYZE.TRADE_PLAN_CARD);
    this.timeframeSelector = page.locator(SELECTORS.ANALYZE.TIMEFRAME_SELECTOR);
    this.errorMessage = page.locator(SELECTORS.ANALYZE.ERROR_MESSAGE);
    this.limitText = page.locator(SELECTORS.ANALYZE.SIGNAL_LIMIT_TEXT);
  }

  /**
   * Navigate to analysis page with optional symbol
   */
  async goto(symbol: string = 'AAPL'): Promise<void> {
    await this.page.goto(`/analyze/${symbol}`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Search for a symbol
   */
  async searchSymbol(symbol: string): Promise<void> {
    await this.symbolInput.fill(symbol);
    await this.searchButton.click();
    await this.waitForResults();
  }

  /**
   * Wait for analysis results to load
   */
  async waitForResults(): Promise<void> {
    await this.page.waitForLoadState('networkidle');

    // Wait for either trade plans or error message
    await this.page.waitForSelector(
      '[data-testid="trade-plan-card"], .text-red-700, text=/error|failed/i',
      { timeout: 15000 },
    );
  }

  /**
   * Get number of trade plan cards displayed
   */
  async getTradePlanCount(): Promise<number> {
    return await this.tradePlanCards.count();
  }

  /**
   * Get all visible timeframes
   */
  async getVisibleTimeframes(): Promise<string[]> {
    const timeframeButtons = await this.timeframeSelector.locator('button').all();
    const visible = [];

    for (const button of timeframeButtons) {
      const isEnabled = await button.isEnabled();
      if (isEnabled) {
        const text = await button.textContent();
        if (text) {
          visible.push(text.trim().toLowerCase());
        }
      }
    }

    return visible;
  }

  /**
   * Check if error message is displayed
   */
  async hasError(): Promise<boolean> {
    try {
      return await this.errorMessage.isVisible({ timeout: 2000 });
    } catch {
      return false;
    }
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string | null> {
    if (await this.hasError()) {
      return await this.errorMessage.textContent();
    }
    return null;
  }

  /**
   * Check if limit text is displayed (e.g., "Top 3 signals")
   */
  async hasLimitText(): Promise<boolean> {
    try {
      return await this.limitText.isVisible({ timeout: 2000 });
    } catch {
      return false;
    }
  }

  /**
   * Get limit text
   */
  async getLimitText(): Promise<string | null> {
    if (await this.hasLimitText()) {
      return await this.limitText.textContent();
    }
    return null;
  }

  /**
   * Check if a specific timeframe is enabled
   */
  async isTimeframeEnabled(timeframe: string): Promise<boolean> {
    const button = this.page.locator(`button:has-text("${timeframe}")`);
    return await button.isEnabled();
  }

  /**
   * Get current symbol from URL
   */
  async getCurrentSymbol(): Promise<string | null> {
    const url = this.page.url();
    const match = url.match(/\/analyze\/([A-Z]+)/);
    return match ? match[1] : null;
  }
}
