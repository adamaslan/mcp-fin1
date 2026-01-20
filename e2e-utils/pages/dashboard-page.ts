import { Page, Locator } from "@playwright/test";
import { SELECTORS } from "../constants/selectors";

/**
 * Page Object Model for Dashboard home page
 * Encapsulates all interactions with the dashboard home
 */
export class DashboardPage {
  readonly page: Page;
  readonly welcomeHeader: Locator;
  readonly analyzeCard: Locator;
  readonly scannerCard: Locator;
  readonly learnCard: Locator;
  readonly gettingStartedSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcomeHeader = page.locator(SELECTORS.DASHBOARD.HEADER);
    this.analyzeCard = page.locator(SELECTORS.DASHBOARD.ANALYZE_CARD);
    this.scannerCard = page.locator(SELECTORS.DASHBOARD.SCANNER_CARD);
    this.learnCard = page.locator(SELECTORS.DASHBOARD.LEARN_CARD);
    this.gettingStartedSection = page.locator("text=Getting Started");
  }

  /**
   * Navigate to dashboard home page
   */
  async goto(): Promise<void> {
    await this.page.goto("/dashboard");
    await this.welcomeHeader.waitFor({ timeout: 10000 });
  }

  /**
   * Click on Analyze card
   */
  async clickAnalyze(): Promise<void> {
    await this.analyzeCard.click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Click on Scanner card
   */
  async clickScanner(): Promise<void> {
    await this.scannerCard.click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Click on Learn card
   */
  async clickLearn(): Promise<void> {
    await this.learnCard.click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Check if dashboard is visible
   */
  async isVisible(): Promise<boolean> {
    try {
      await this.welcomeHeader.waitFor({ timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if all quick action cards are visible
   */
  async haveQuickActionCards(): Promise<boolean> {
    const analyzeVisible = await this.analyzeCard.isVisible();
    const scannerVisible = await this.scannerCard.isVisible();
    const learnVisible = await this.learnCard.isVisible();

    return analyzeVisible && scannerVisible && learnVisible;
  }

  /**
   * Check if getting started section is visible
   */
  async hasGettingStartedSection(): Promise<boolean> {
    try {
      await this.gettingStartedSection.waitFor({ timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get welcome message text
   */
  async getWelcomeMessage(): Promise<string | null> {
    return await this.welcomeHeader.textContent();
  }
}
