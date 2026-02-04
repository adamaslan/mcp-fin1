import { NextResponse } from "next/server";
import { ensureUserInitialized } from "@/lib/auth/user-init";
import { TIER_LIMITS } from "@/lib/auth/tiers";
import { getCurrentUsage } from "@/lib/auth/usage-limits";

/**
 * Get user's usage statistics for current day
 */
export async function GET() {
  try {
    const { userId, tier } = await ensureUserInitialized();
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // Get today's usage
    const currentUsage = await getCurrentUsage(userId);

    const limits = TIER_LIMITS[tier];

    return NextResponse.json({
      success: true,
      data: {
        tier,
        date: today,
        analyses: {
          used: currentUsage.analysisCount || 0,
          limit: limits.analysesPerDay,
          remaining:
            limits.analysesPerDay === Infinity
              ? Infinity
              : Math.max(
                  0,
                  limits.analysesPerDay - (currentUsage.analysisCount || 0),
                ),
        },
        scans: {
          used: currentUsage.scanCount || 0,
          limit: limits.scansPerDay,
          remaining:
            limits.scansPerDay === Infinity
              ? Infinity
              : Math.max(0, limits.scansPerDay - (currentUsage.scanCount || 0)),
        },
      },
    });
  } catch (error) {
    console.error("Usage stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch usage stats" },
      { status: 500 },
    );
  }
}
