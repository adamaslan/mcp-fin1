/**
 * Centralized selector constants for all E2E tests
 * Keep these updated as UI changes to avoid selector maintenance across test files
 */
export const SELECTORS = {
  AUTH: {
    EMAIL_INPUT: 'input[name="identifier"], input[type="email"]',
    PASSWORD_INPUT: 'input[name="password"], input[type="password"]',
    SUBMIT_BUTTON: 'button[type="submit"]',
  },

  HEADER: {
    USER_MENU: '[data-testid="user-menu"], button:has-text("Sign out")',
    SIGN_OUT: 'button:has-text("Sign out")',
  },

  DASHBOARD: {
    HEADER: 'h1:has-text("Welcome back")',
    ANALYZE_CARD: '[data-testid="analyze-card"], a:has-text("Analyze a Stock")',
    SCANNER_CARD: '[data-testid="scanner-card"], a:has-text("Scan for Trades")',
    LEARN_CARD: '[data-testid="learn-card"], a:has-text("Learn Signals")',
  },

  SIDEBAR: {
    TIER_BADGE: "text=/Tier: (FREE|PRO|MAX)/i",
    LOCKED_LINK: ".opacity-50",
    DASHBOARD_LINK: 'a:has-text("Dashboard")',
    ANALYZE_LINK: 'a:has-text("Analyze")',
    SCANNER_LINK: 'a:has-text("Scanner")',
    WATCHLIST_LINK: 'a:has-text("Watchlist")',
    PORTFOLIO_LINK: 'a:has-text("Portfolio")',
    JOURNAL_LINK: 'a:has-text("Journal")',
    ALERTS_LINK: 'a:has-text("Alerts")',
  },

  ANALYZE: {
    SYMBOL_INPUT: 'input[placeholder*="symbol"], input[placeholder*="ticker"]',
    SEARCH_BUTTON: 'button:has-text("Search"), button:has-text("Analyze")',
    TRADE_PLAN_CARD: '[data-testid="trade-plan-card"]',
    TIMEFRAME_SELECTOR:
      '[data-testid="timeframe-selector"], select, button:has-text("Swing")',
    SIGNAL_LIMIT_TEXT: "text=/Top 3|Top 10|All/",
    ERROR_MESSAGE: ".text-red-700, text=/error|failed/i",
  },

  SCANNER: {
    UNIVERSE_SELECT: '[data-testid="universe-select"], select',
    SCAN_BUTTON: 'button:has-text("Scan")',
    RESULTS_TABLE: "table",
    RESULT_ROWS: "tbody tr",
    ERROR_MESSAGE: ".text-red-700, text=/error|failed/i",
    LIMIT_WARNING: ".text-blue-700, text=/limit|quota/i",
  },

  TIER_GATE: {
    UPGRADE_PROMPT: "text=/upgrade|premium|pro|max/i",
    UPGRADE_BUTTON: 'a[href*="/pricing"], button:has-text("Upgrade")',
    LOCKED_FEATURE: '.opacity-50, [aria-disabled="true"]',
  },
};
