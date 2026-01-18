import { Page, Locator } from '@playwright/test';
import { SELECTORS } from '../constants/selectors';

/**
 * Page Object Model for Scanner feature page
 * Encapsulates all interactions with the trade scanner
 */
export class ScannerPage {
  readonly page: Page;
  readonly universeSelect: Locator;
  readonly scanButton: Locator;
  readonly resultsTable: Locator;
  readonly resultRows: Locator;
  readonly errorMessage: Locator;
  readonly limitWarning: Locator;

  constructor(page: Page) {
    this.page = page;
    this.universeSelect = page.locator(SELECTORS.SCANNER.UNIVERSE_SELECT);
    this.scanButton = page.locator(SELECTORS.SCANNER.SCAN_BUTTON);
    this.resultsTable = page.locator(SELECTORS.SCANNER.RESULTS_TABLE);
    this.resultRows = page.locator(SELECTORS.SCANNER.RESULT_ROWS);
    this.errorMessage = page.locator(SELECTORS.SCANNER.ERROR_MESSAGE);
    this.limitWarning = page.locator(SELECTORS.SCANNER.LIMIT_WARNING);
  }

  /**
   * Navigate to scanner page
   */
  async goto(): Promise<void> {
    await this.page.goto('/scanner');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Select a universe to scan
   */
  async selectUniverse(universe: string): Promise<void> {
    await this.universeSelect.click();
    await this.page.locator(`[value="${universe}"]`).click();
  }

  /**
   * Run a scan
   */
  async runScan(): Promise<void> {
    await this.scanButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get number of results returned
   */
  async getResultCount(): Promise<number> {
    try {
      await this.resultsTable.waitFor({ timeout: 5000 });
      return await this.resultRows.count();
    } catch {
      return 0;
    }
  }

  /**
   * Check if a universe option is locked (disabled)
   */
  async isUniverseLocked(universe: string): Promise<boolean> {
    await this.universeSelect.click();
    const option = this.page.locator(`[value="${universe}"]`);

    try {
      const disabled = await option.getAttribute('disabled');
      return disabled !== null;
    } finally {
      // Close select
      await this.page.keyboard.press('Escape');
    }
  }

  /**
   * Check if limit warning is displayed
   */
  async hasLimitWarning(): Promise<boolean> {
    try {
      return await this.limitWarning.isVisible({ timeout: 2000 });
    } catch {
      return false;
    }
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
   * Get all available universes in dropdown
   */
  async getAvailableUniverses(): Promise<string[]> {
    await this.universeSelect.click();

    const options = await this.page.locator(`${SELECTORS.SCANNER.UNIVERSE_SELECT} [value]`).all();
    const universes = [];

    for (const option of options) {
      const value = await option.getAttribute('value');
      if (value) {
        universes.push(value);
      }
    }

    await this.page.keyboard.press('Escape');
    return universes;
  }

  /**
   * Check if scan button is enabled
   */
  async isScanButtonEnabled(): Promise<boolean> {
    return await this.scanButton.isEnabled();
  }

  /**
   * Get limit warning text
   */
  async getLimitWarningText(): Promise<string | null> {
    if (await this.hasLimitWarning()) {
      return await this.limitWarning.textContent();
    }
    return null;
  }
}
