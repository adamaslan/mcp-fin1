/**
 * E2E TEST CONFIGURATION - Single Source of Truth
 *
 * Change parameters here to modify ALL E2E tests.
 * Matches the Python test_config.py for consistency.
 *
 * Usage:
 *   1. Edit CONFIG below
 *   2. Run: npm run test:e2e -- e2e/unified/
 */

// =============================================================================
// PRIMARY TEST CONFIGURATION
// =============================================================================

export const CONFIG = {
  // PRIMARY STOCK (main test target)
  primaryStock: "MU",

  // COMPARISON STOCK (for comparison tests)
  comparisonStock: "NVDA",

  // PERIOD for all analysis
  period: "3mo",

  // USE AI (Pro tier only)
  useAi: false,

  // FIBONACCI settings
  fibonacciWindow: 150,

  // OPTIONS settings (options_risk_analysis parameters)
  optionsExpirationDate: null as string | null, // null = nearest expiration
  optionsType: "both" as const, // "calls", "puts", or "both"
  optionsMinVolume: 75,

  // PORTFOLIO positions
  portfolioPositions: [
    { symbol: "MU", shares: 100, entryPrice: 90 },
    { symbol: "NVDA", shares: 50, entryPrice: 120 },
  ],

  // WATCHLIST
  watchlist: ["MU", "NVDA"],

  // SCREENING (screen_securities parameters)
  screenUniverse: "nasdaq100", // Must be: "sp500", "nasdaq100", "etf_large_cap"
  screenCriteria: { min_score: 50 },
  screenLimit: 5,

  // TRADE SCANNING (scan_trades parameters)
  scanUniverse: "nasdaq100", // Must be: "sp500", "nasdaq100", "etf_large_cap", "crypto"
  scanMaxResults: 5,
};

// =============================================================================
// E2E TEST SETTINGS
// =============================================================================

export const E2E_CONFIG = {
  // Base URL
  baseUrl: process.env.TEST_BASE_URL || "http://localhost:3000",

  // Timeouts (ms)
  landingPageLoadMs: 2000,
  controlPageLoadMs: 3000,
  toolExecutionMs: 5000,

  // Viewports
  mobile: { width: 375, height: 667 },
  desktop: { width: 1280, height: 720 },

  // Routes
  routes: {
    landing: "/",
    mcpControl: "/mcp-control",
    signIn: "/sign-in",
    signUp: "/sign-up",
    dashboard: "/dashboard",
  },
};

// =============================================================================
// TOOL DEFINITIONS (All 9 MCP Tools)
// =============================================================================

export const MCP_TOOLS = [
  {
    name: "analyze_security",
    displayName: "Analyze Security",
    params: { symbol: CONFIG.primaryStock, period: CONFIG.period },
  },
  {
    name: "analyze_fibonacci",
    displayName: "Fibonacci Analysis",
    params: {
      symbol: CONFIG.primaryStock,
      period: CONFIG.period,
      window: CONFIG.fibonacciWindow,
    },
  },
  {
    name: "get_trade_plan",
    displayName: "Trade Plan",
    params: { symbol: CONFIG.primaryStock, period: CONFIG.period },
  },
  {
    name: "compare_securities",
    displayName: "Compare Securities",
    params: {
      symbols: [CONFIG.primaryStock, CONFIG.comparisonStock],
      period: CONFIG.period,
    },
  },
  {
    name: "screen_securities",
    displayName: "Screen Securities",
    params: {
      universe: CONFIG.screenUniverse,
      criteria: CONFIG.screenCriteria,
      limit: CONFIG.screenLimit,
      period: CONFIG.period,
    },
  },
  {
    name: "scan_trades",
    displayName: "Scan Trades",
    params: {
      universe: CONFIG.scanUniverse,
      max_results: CONFIG.scanMaxResults,
      period: CONFIG.period,
    },
  },
  {
    name: "portfolio_risk",
    displayName: "Portfolio Risk",
    params: {
      positions: CONFIG.portfolioPositions,
      period: CONFIG.period,
    },
  },
  {
    name: "morning_brief",
    displayName: "Morning Brief",
    params: {
      watchlist: CONFIG.watchlist,
      marketRegion: "US",
      period: CONFIG.period,
    },
  },
  {
    name: "options_risk_analysis",
    displayName: "Options Risk",
    params: {
      symbol: CONFIG.primaryStock,
      expiration_date: CONFIG.optionsExpirationDate,
      option_type: CONFIG.optionsType,
      min_volume: CONFIG.optionsMinVolume,
    },
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getTestSymbols(): string[] {
  const symbols = new Set<string>();
  symbols.add(CONFIG.primaryStock);
  symbols.add(CONFIG.comparisonStock);
  CONFIG.portfolioPositions.forEach((pos) => symbols.add(pos.symbol));
  CONFIG.watchlist.forEach((sym) => symbols.add(sym));
  return Array.from(symbols);
}

export function getComparisonSymbols(): string[] {
  return [CONFIG.primaryStock, CONFIG.comparisonStock];
}

export function printConfig(): void {
  console.log("=".repeat(60));
  console.log("E2E TEST CONFIGURATION");
  console.log("=".repeat(60));
  console.log(`Primary Stock:     ${CONFIG.primaryStock}`);
  console.log(`Comparison Stock:  ${CONFIG.comparisonStock}`);
  console.log(`Period:            ${CONFIG.period}`);
  console.log(`Use AI:            ${CONFIG.useAi}`);
  console.log(`All Test Symbols:  ${getTestSymbols().join(", ")}`);
  console.log("=".repeat(60));
}
