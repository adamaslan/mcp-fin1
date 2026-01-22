export type UserTier = "free" | "pro" | "max";

export interface TierLimits {
  analysesPerDay: number;
  scansPerDay: number;
  scanResultsLimit: number;
  watchlistCount: number;
  watchlistSymbolLimit: number;
  timeframes: ("swing" | "day" | "scalp")[];
  universes: string[];
  features: string[];
  fibonacciLevels: string[] | "all_retracements_extensions" | "all";
  fibonacciCategories: string[] | "all";
  fibonacciSignalsLimit: number;
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
    ],
    fibonacciLevels: ["RETRACE_236", "RETRACE_382", "RETRACE_618"],
    fibonacciCategories: ["FIB_PRICE_LEVEL", "FIB_BOUNCE"],
    fibonacciSignalsLimit: 3,
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
    ],
    fibonacciLevels: "all",
    fibonacciCategories: "all",
    fibonacciSignalsLimit: Infinity,
  },
};

export function canAccessFeature(tier: UserTier, feature: string): boolean {
  return TIER_LIMITS[tier].features.includes(feature);
}

export function canAccessTimeframe(
  tier: UserTier,
  timeframe: "swing" | "day" | "scalp",
): boolean {
  return TIER_LIMITS[tier].timeframes.includes(timeframe);
}

export function canAccessUniverse(tier: UserTier, universe: string): boolean {
  return TIER_LIMITS[tier].universes.includes(universe);
}
