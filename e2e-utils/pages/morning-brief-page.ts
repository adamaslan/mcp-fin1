import { Page, Locator } from "@playwright/test";

export class MorningBriefPage {
  readonly page: Page;
  readonly marketStatusCard: Locator;
  readonly economicEventsCard: Locator;
  readonly watchlistSignalsCard: Locator;
  readonly sectorMovementCard: Locator;
  readonly sectorLeadersCard: Locator;
  readonly sectorLosersCard: Locator;
  readonly keyThemesCard: Locator;
  readonly aiToggle: Locator;
  readonly aiToggleLabel: Locator;
  readonly aiPanel: Locator;
  readonly errorMessage: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.marketStatusCard = page.locator('[data-testid="market-status-card"]');
    this.economicEventsCard = page.locator(
      '[data-testid="economic-events-card"]',
    );
    this.watchlistSignalsCard = page.locator(
      '[data-testid="watchlist-signals-card"]',
    );
    this.sectorMovementCard = page.locator(
      '[data-testid="sector-movement-card"]',
    );
    this.sectorLeadersCard = page.locator(
      '[data-testid="sector-leaders-card"]',
    );
    this.sectorLosersCard = page.locator('[data-testid="sector-losers-card"]');
    this.keyThemesCard = page.locator('[data-testid="key-themes-card"]');
    this.aiToggle = page.locator("#ai-toggle");
    this.aiToggleLabel = page.locator("label:has(#ai-toggle)");
    this.aiPanel = page.locator('[data-testid="ai-insights-panel"]');
    this.errorMessage = page.locator('[role="alert"]');
    this.loadingSpinner = page.locator('[data-testid="loading-spinner"]');
  }

  async goto(): Promise<void> {
    await this.page.goto("/morning-brief");
    await this.page.waitForLoadState("networkidle");
  }

  // Market Status
  async hasMarketStatus(): Promise<boolean> {
    return await this.marketStatusCard.isVisible();
  }

  async hasFuturesData(): Promise<boolean> {
    return await this.page.locator("text=/ES|NQ/").isVisible();
  }

  async getMarketStatusBadgeText(): Promise<string | null> {
    return await this.marketStatusCard
      .locator("text=/OPEN|CLOSED|PRE_MARKET|AFTER_HOURS/")
      .first()
      .textContent();
  }

  // Economic Events
  async getEconomicEventCount(): Promise<number> {
    return await this.page.locator('[data-testid="economic-event"]').count();
  }

  async hasEconomicEvents(): Promise<boolean> {
    return (await this.getEconomicEventCount()) > 0;
  }

  // Watchlist Signals
  async getWatchlistSignalCount(): Promise<number> {
    return await this.page.locator('[data-testid="watchlist-signal"]').count();
  }

  async hasWatchlistSignals(): Promise<boolean> {
    return (await this.getWatchlistSignalCount()) > 0;
  }

  async getWatchlistSymbols(): Promise<string[]> {
    const symbols = await this.page
      .locator('[data-testid="watchlist-signal"]')
      .evaluate(
        (elements) =>
          Array.from(elements).map(
            (el) => el.querySelector("h3")?.textContent || "",
          ),
        [],
      );
    return symbols;
  }

  // Sector Movement
  async hasSectorLeaders(): Promise<boolean> {
    return await this.sectorLeadersCard.isVisible();
  }

  async hasSectorLosers(): Promise<boolean> {
    return await this.sectorLosersCard.isVisible();
  }

  // Key Themes
  async getKeyThemeCount(): Promise<number> {
    return await this.page.locator('[data-testid="key-theme"]').count();
  }

  async hasKeyThemes(): Promise<boolean> {
    return (await this.getKeyThemeCount()) > 0;
  }

  // AI Toggle
  async isAIToggleDisabled(): Promise<boolean> {
    return !(await this.aiToggle.isEnabled());
  }

  async isAIToggleChecked(): Promise<boolean> {
    return await this.aiToggle.isChecked();
  }

  async hasAIPlusBadge(): Promise<boolean> {
    return await this.page.locator('text="(Pro+)"').isVisible();
  }

  async enableAI(): Promise<void> {
    if (!(await this.aiToggle.isChecked())) {
      await this.aiToggle.check();
      // Wait for refetch to complete
      await this.page.waitForLoadState("networkidle");
    }
  }

  async disableAI(): Promise<void> {
    if (await this.aiToggle.isChecked()) {
      await this.aiToggle.uncheck();
      // Wait for refetch to complete
      await this.page.waitForLoadState("networkidle");
    }
  }

  // AI Panel
  async hasAIPanel(): Promise<boolean> {
    try {
      return await this.aiPanel.isVisible({ timeout: 3000 });
    } catch {
      return false;
    }
  }

  async getAIPanelTitle(): Promise<string | null> {
    return await this.aiPanel.locator("h3").first().textContent();
  }

  // States
  async hasError(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent()) || "";
  }

  async hasLoadingState(): Promise<boolean> {
    return await this.loadingSpinner.isVisible();
  }

  async waitForDataLoad(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
    // Ensure at least one data card is visible
    await this.marketStatusCard.waitFor({ state: "visible", timeout: 5000 });
  }

  async clickWatchlistSymbol(symbol: string): Promise<void> {
    const symbolLink = this.page.locator(
      `[data-testid="watchlist-signal"]:has-text("${symbol}")`,
    );
    await symbolLink.click();
  }

  // Intercept API calls for testing
  async interceptMorningBriefAPI(
    handler: (route: any) => Promise<void>,
  ): Promise<void> {
    await this.page.route("**/api/mcp/morning-brief", handler);
  }
}
