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
    ],
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
    ],
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
    ],
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
