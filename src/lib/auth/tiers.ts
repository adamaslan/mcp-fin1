export type UserTier = "free" | "pro" | "max";

/**
 * MCP Tool names for type safety
 */
export type MCPTool =
  | "analyze_security"
  | "compare_securities"
  | "screen_securities"
  | "get_trade_plan"
  | "scan_trades"
  | "portfolio_risk"
  | "morning_brief"
  | "analyze_fibonacci"
  | "options_risk_analysis";

/**
 * AI access configuration per tool
 */
export interface AIAccessConfig {
  analyze_security: boolean;
  compare_securities: boolean;
  screen_securities: boolean;
  get_trade_plan: boolean;
  scan_trades: boolean;
  portfolio_risk: boolean;
  morning_brief: boolean;
  analyze_fibonacci: boolean;
  options_risk_analysis: boolean;
}

/**
 * Tool-specific limits
 */
export interface ToolLimits {
  /** Whether the tool is available at all */
  enabled: boolean;
  /** Daily usage limit (Infinity for unlimited) */
  daily?: number;
  /** Whether AI analysis is available */
  ai?: boolean;
  /** Additional tool-specific limits */
  [key: string]: unknown;
}

export interface TierLimits {
  // General limits
  analysesPerDay: number;
  scansPerDay: number;
  scanResultsLimit: number;
  watchlistCount: number;
  watchlistSymbolLimit: number;
  timeframes: ("swing" | "day" | "scalp")[];
  universes: string[];
  features: string[];

  // Fibonacci-specific
  fibonacciLevels: string[] | "all_retracements_extensions" | "all";
  fibonacciCategories: string[] | "all";
  fibonacciSignalsLimit: number;

  // AI access per tool
  aiAccess: AIAccessConfig;

  // Tool-specific limits
  tools: {
    analyze_security: ToolLimits;
    compare_securities: ToolLimits & { maxSymbols: number };
    screen_securities: ToolLimits;
    get_trade_plan: ToolLimits;
    scan_trades: ToolLimits & { maxResults: number };
    portfolio_risk: ToolLimits;
    morning_brief: ToolLimits;
    analyze_fibonacci: ToolLimits;
    options_risk_analysis: ToolLimits;
  };
}

export const TIER_LIMITS: Record<UserTier, TierLimits> = {
  free: {
    analysesPerDay: 5,
    scansPerDay: 1,
    scanResultsLimit: 5,
    watchlistCount: 1,
    watchlistSymbolLimit: 10,
    timeframes: ["swing"],
    universes: ["sp500"],
    features: [
      "basic_trade_plan",
      "signal_help",
      "indicator_help",
      "morning_brief_limited",
      "basic_fibonacci",
      "options_analysis",
    ],
    fibonacciLevels: ["RETRACE_236", "RETRACE_382", "RETRACE_618"],
    fibonacciCategories: ["FIB_PRICE_LEVEL", "FIB_BOUNCE"],
    fibonacciSignalsLimit: 3,

    // Free tier: No AI access
    aiAccess: {
      analyze_security: false,
      compare_securities: false,
      screen_securities: false,
      get_trade_plan: false,
      scan_trades: false,
      portfolio_risk: false,
      morning_brief: false,
      analyze_fibonacci: false,
      options_risk_analysis: false,
    },

    tools: {
      analyze_security: { enabled: true, daily: 5, ai: false },
      compare_securities: { enabled: false, maxSymbols: 0, ai: false },
      screen_securities: { enabled: true, daily: 1, ai: false },
      get_trade_plan: { enabled: true, daily: 5, ai: false },
      scan_trades: { enabled: true, daily: 1, maxResults: 5, ai: false },
      portfolio_risk: { enabled: false, ai: false },
      morning_brief: { enabled: true, daily: 1, ai: false },
      analyze_fibonacci: { enabled: true, daily: 3, ai: false },
      options_risk_analysis: { enabled: true, monthly: 5, ai: false },
    },
  },

  pro: {
    analysesPerDay: 50,
    scansPerDay: 10,
    scanResultsLimit: 25,
    watchlistCount: 5,
    watchlistSymbolLimit: 50,
    timeframes: ["swing", "day", "scalp"],
    universes: ["sp500", "nasdaq100", "etf_large_cap"],
    features: [
      "basic_trade_plan",
      "full_trade_plan",
      "all_timeframes",
      "portfolio_risk",
      "sector_concentration",
      "position_tracking",
      "trade_journal",
      "option_suggestions",
      "morning_brief_full",
      "signal_help",
      "indicator_help",
      "advanced_fibonacci",
      "fibonacci_channels",
      "fibonacci_clusters",
      "ai_analysis",
      "options_analysis",
    ],
    fibonacciLevels: "all_retracements_extensions",
    fibonacciCategories: [
      "FIB_PRICE_LEVEL",
      "FIB_BOUNCE",
      "FIB_BREAKOUT",
      "FIB_CHANNEL",
      "FIB_CLUSTER",
      "FIB_MTF_CLUSTER",
      "FIB_VOLUME",
      "FIB_MA_CONFLUENCE",
      "FIB_RSI_DIVERGENCE",
      "FIB_GOLDEN_POCKET",
    ],
    fibonacciSignalsLimit: 15,

    // Pro tier: AI available on request
    aiAccess: {
      analyze_security: true,
      compare_securities: true,
      screen_securities: true,
      get_trade_plan: true,
      scan_trades: true,
      portfolio_risk: true,
      morning_brief: true,
      analyze_fibonacci: true,
      options_risk_analysis: true,
    },

    tools: {
      analyze_security: { enabled: true, daily: 50, ai: true },
      compare_securities: { enabled: true, maxSymbols: 5, ai: true },
      screen_securities: { enabled: true, daily: 10, ai: true },
      get_trade_plan: { enabled: true, daily: 50, ai: true },
      scan_trades: { enabled: true, daily: 10, maxResults: 25, ai: true },
      portfolio_risk: { enabled: true, ai: true },
      morning_brief: { enabled: true, daily: Infinity, ai: true },
      analyze_fibonacci: { enabled: true, daily: 15, ai: true },
      options_risk_analysis: { enabled: true, ai: true },
    },
  },

  max: {
    analysesPerDay: Infinity,
    scansPerDay: Infinity,
    scanResultsLimit: 50,
    watchlistCount: Infinity,
    watchlistSymbolLimit: Infinity,
    timeframes: ["swing", "day", "scalp"],
    universes: ["sp500", "nasdaq100", "etf_large_cap", "crypto"],
    features: [
      "basic_trade_plan",
      "full_trade_plan",
      "all_timeframes",
      "portfolio_risk",
      "sector_concentration",
      "position_tracking",
      "trade_journal",
      "option_suggestions",
      "hedge_suggestions",
      "raw_signals",
      "raw_indicators",
      "alerts",
      "email_briefs",
      "api_access",
      "export",
      "multi_universe_scan",
      "signal_help",
      "indicator_help",
      "morning_brief_full",
      "advanced_fibonacci",
      "fibonacci_channels",
      "fibonacci_clusters",
      "harmonic_patterns",
      "elliott_wave_fib",
      "fibonacci_arcs_fans",
      "fibonacci_alerts",
      "ai_analysis",
      "ai_always_on",
      "options_analysis",
      "options_full",
    ],
    fibonacciLevels: "all",
    fibonacciCategories: "all",
    fibonacciSignalsLimit: Infinity,

    // Max tier: AI always available
    aiAccess: {
      analyze_security: true,
      compare_securities: true,
      screen_securities: true,
      get_trade_plan: true,
      scan_trades: true,
      portfolio_risk: true,
      morning_brief: true,
      analyze_fibonacci: true,
      options_risk_analysis: true,
    },

    tools: {
      analyze_security: { enabled: true, daily: Infinity, ai: true },
      compare_securities: { enabled: true, maxSymbols: 10, ai: true },
      screen_securities: { enabled: true, daily: Infinity, ai: true },
      get_trade_plan: { enabled: true, daily: Infinity, ai: true },
      scan_trades: { enabled: true, daily: Infinity, maxResults: 50, ai: true },
      portfolio_risk: { enabled: true, ai: true },
      morning_brief: { enabled: true, daily: Infinity, ai: true },
      analyze_fibonacci: { enabled: true, daily: Infinity, ai: true },
      options_risk_analysis: { enabled: true, ai: true },
    },
  },
};

/**
 * Check if a feature is accessible for a tier
 */
export function canAccessFeature(tier: UserTier, feature: string): boolean {
  return TIER_LIMITS[tier].features.includes(feature);
}

/**
 * Check if a timeframe is accessible for a tier
 */
export function canAccessTimeframe(
  tier: UserTier,
  timeframe: "swing" | "day" | "scalp",
): boolean {
  return TIER_LIMITS[tier].timeframes.includes(timeframe);
}

/**
 * Check if a universe is accessible for a tier
 */
export function canAccessUniverse(tier: UserTier, universe: string): boolean {
  return TIER_LIMITS[tier].universes.includes(universe);
}

/**
 * Check if AI is accessible for a specific tool and tier
 */
export function canAccessAI(tier: UserTier, tool: MCPTool): boolean {
  return TIER_LIMITS[tier].aiAccess[tool];
}

/**
 * Check if a tool is enabled for a tier
 */
export function isToolEnabled(tier: UserTier, tool: MCPTool): boolean {
  return TIER_LIMITS[tier].tools[tool].enabled;
}

/**
 * Get tool limits for a tier
 */
export function getToolLimits(tier: UserTier, tool: MCPTool): ToolLimits {
  return TIER_LIMITS[tier].tools[tool];
}
