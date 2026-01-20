import {
  getTodayUsage,
  incrementAnalysisCount,
  incrementScanCount,
} from "@/lib/db/queries";
import { TIER_LIMITS, type UserTier } from "./tiers";

export class UsageLimitExceededError extends Error {
  constructor(
    public readonly feature: "analysis" | "scan",
    public readonly limit: number,
    public readonly current: number,
  ) {
    super(`${feature} limit exceeded: ${current}/${limit} today`);
    this.name = "UsageLimitExceededError";
  }
}

/**
 * Check if user can perform an analysis
 * Throws UsageLimitExceededError if limit is reached
 */
export async function checkAnalysisLimit(
  userId: string,
  tier: UserTier,
): Promise<void> {
  const tierLimits = TIER_LIMITS[tier];
  const usage = await getTodayUsage(userId);

  if (usage.analysisCount >= tierLimits.analysesPerDay) {
    throw new UsageLimitExceededError(
      "analysis",
      tierLimits.analysesPerDay,
      usage.analysisCount,
    );
  }
}

/**
 * Check if user can perform a scan
 * Throws UsageLimitExceededError if limit is reached
 */
export async function checkScanLimit(
  userId: string,
  tier: UserTier,
): Promise<void> {
  const tierLimits = TIER_LIMITS[tier];
  const usage = await getTodayUsage(userId);

  if (usage.scanCount >= tierLimits.scansPerDay) {
    throw new UsageLimitExceededError(
      "scan",
      tierLimits.scansPerDay,
      usage.scanCount,
    );
  }
}

/**
 * Record an analysis and return updated count
 * Should be called after a successful analysis
 */
export async function recordAnalysis(userId: string): Promise<number> {
  await incrementAnalysisCount(userId);
  const updated = await getTodayUsage(userId);
  return updated.analysisCount;
}

/**
 * Record a scan and return updated count
 * Should be called after a successful scan
 */
export async function recordScan(userId: string): Promise<number> {
  await incrementScanCount(userId);
  const updated = await getTodayUsage(userId);
  return updated.scanCount;
}

/**
 * Get current usage for a user
 */
export async function getCurrentUsage(userId: string) {
  const usage = await getTodayUsage(userId);
  return usage;
}
