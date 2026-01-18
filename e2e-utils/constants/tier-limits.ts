/**
 * Tier limit constants for testing
 * These match the tier configuration in /src/lib/auth/tiers.ts
 */

export type UserTier = 'free' | 'pro' | 'max';

export interface TierLimits {
  analysesPerDay: number;
  scansPerDay: number;
  scanResultsLimit: number;
  watchlistCount: number;
  watchlistSymbolLimit: number;
  timeframes: string[];
  universes: string[];
  signalsVisible: number;
}

export const TIER_LIMITS: Record<UserTier, TierLimits> = {
  free: {
    analysesPerDay: 5,
    scansPerDay: 1,
    scanResultsLimit: 5,
    watchlistCount: 1,
    watchlistSymbolLimit: 10,
    timeframes: ['swing'],
    universes: ['sp500'],
    signalsVisible: 3,
  },

  pro: {
    analysesPerDay: 50,
    scansPerDay: 10,
    scanResultsLimit: 25,
    watchlistCount: 5,
    watchlistSymbolLimit: 50,
    timeframes: ['swing', 'day', 'scalp'],
    universes: ['sp500', 'nasdaq100', 'etf_large_cap'],
    signalsVisible: 10,
  },

  max: {
    analysesPerDay: Infinity,
    scansPerDay: Infinity,
    scanResultsLimit: 50,
    watchlistCount: Infinity,
    watchlistSymbolLimit: Infinity,
    timeframes: ['swing', 'day', 'scalp'],
    universes: ['sp500', 'nasdaq100', 'etf_large_cap', 'crypto'],
    signalsVisible: Infinity,
  },
};
