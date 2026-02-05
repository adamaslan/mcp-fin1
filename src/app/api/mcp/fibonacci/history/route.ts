import { NextResponse } from "next/server";
import { db, fibonacciSignalHistory } from "@/lib/db";
import { eq, gte, and, desc } from "drizzle-orm";
import { ensureUserInitialized } from "@/lib/auth/user-init";
import type { FibonacciSignalHistory as FibonacciSignalRecord } from "@/lib/db";

/**
 * Historical Fibonacci Signal Performance Endpoint
 *
 * GET /api/mcp/fibonacci/history
 *
 * Retrieves historical Fibonacci signal data and performance metrics.
 *
 * Query Parameters:
 *   - symbol: Ticker symbol (required)
 *   - lookback_days: Days to look back (default: 90)
 *   - min_strength: Minimum strength filter (WEAK|MODERATE|SIGNIFICANT|STRONG|VERY_STRONG)
 *   - min_confluence: Minimum confluence score (0-100, default: 30)
 *   - limit: Max records to return (default: 100)
 *
 * Returns:
 *   - signals: Array of historical signal records
 *   - performance: Aggregated metrics by category and strength
 *   - summary: Overall statistics
 */
export async function GET(request: Request) {
  try {
    // Authentication
    const { userId } = await ensureUserInitialized();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");
    const lookbackDays = parseInt(
      searchParams.get("lookback_days") || "90",
      10,
    );
    const minStrength = searchParams.get("min_strength") || "MODERATE";
    const minConfluence = parseFloat(
      searchParams.get("min_confluence") || "30",
    );
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    // Validate required parameters
    if (!symbol) {
      return NextResponse.json(
        { error: "Symbol parameter is required" },
        { status: 400 },
      );
    }

    const symbolUpper = symbol.toUpperCase().trim();

    // Calculate cutoff date
    const now = new Date();
    const cutoffDate = new Date(
      now.getTime() - lookbackDays * 24 * 60 * 60 * 1000,
    );

    // Strength level validation
    const strengthLevels = [
      "WEAK",
      "MODERATE",
      "SIGNIFICANT",
      "STRONG",
      "VERY_STRONG",
    ];
    const validStrength = strengthLevels.includes(minStrength)
      ? minStrength
      : "MODERATE";
    const minStrengthIdx = strengthLevels.indexOf(validStrength);
    const validStrengths = strengthLevels.slice(minStrengthIdx);

    // Query historical signals
    const signals = await db
      .select()
      .from(fibonacciSignalHistory)
      .where(
        and(
          eq(fibonacciSignalHistory.symbol, symbolUpper),
          gte(fibonacciSignalHistory.timestamp, cutoffDate),
          // confluenceScore is stored as string (PgNumeric) in DB
          gte(fibonacciSignalHistory.confluenceScore, minConfluence.toString()),
        ),
      )
      .orderBy(desc(fibonacciSignalHistory.timestamp))
      .limit(limit);

    // Filter by strength (after query since ENUM filtering is complex in Drizzle)
    const filteredSignals = signals.filter((s: FibonacciSignalRecord) =>
      validStrengths.includes(s.strength),
    );

    // Calculate performance metrics
    const performanceByCategory: Record<string, PerformanceMetrics> = {};
    const performanceByStrength: Record<string, PerformanceMetrics> = {};

    let totalWins30d = 0;
    let totalWins90d = 0;
    let totalSignalsWithOutcome30d = 0;
    let totalSignalsWithOutcome90d = 0;
    const returns30d: number[] = [];
    const returns90d: number[] = [];

    for (const signal of filteredSignals) {
      const category = signal.category;
      const strength = signal.strength;

      // Initialize category metrics
      if (!performanceByCategory[category]) {
        performanceByCategory[category] = {
          count: 0,
          wins_30d: 0,
          wins_90d: 0,
          returns_30d: [],
          returns_90d: [],
        };
      }

      // Initialize strength metrics
      if (!performanceByStrength[strength]) {
        performanceByStrength[strength] = {
          count: 0,
          wins_30d: 0,
          wins_90d: 0,
          returns_30d: [],
          returns_90d: [],
        };
      }

      // Increment counts
      performanceByCategory[category].count += 1;
      performanceByStrength[strength].count += 1;

      // Process 30-day outcome
      if (signal.outcomeReturnPercent30d !== null) {
        const return30d = parseFloat(signal.outcomeReturnPercent30d.toString());
        totalSignalsWithOutcome30d += 1;
        returns30d.push(return30d);

        if (return30d > 0) {
          totalWins30d += 1;
          performanceByCategory[category].wins_30d += 1;
          performanceByStrength[strength].wins_30d += 1;
        }

        performanceByCategory[category].returns_30d.push(return30d);
        performanceByStrength[strength].returns_30d.push(return30d);
      }

      // Process 90-day outcome
      if (signal.outcomeReturnPercent90d !== null) {
        const return90d = parseFloat(signal.outcomeReturnPercent90d.toString());
        totalSignalsWithOutcome90d += 1;
        returns90d.push(return90d);

        if (return90d > 0) {
          totalWins90d += 1;
          performanceByCategory[category].wins_90d += 1;
          performanceByStrength[strength].wins_90d += 1;
        }

        performanceByCategory[category].returns_90d.push(return90d);
        performanceByStrength[strength].returns_90d.push(return90d);
      }
    }

    // Calculate aggregated metrics
    const formatCategoryMetrics = (
      data: Record<string, PerformanceMetrics>,
    ): Record<string, FormattedMetrics> => {
      const result: Record<string, FormattedMetrics> = {};

      for (const [key, metrics] of Object.entries(data) as Array<
        [string, PerformanceMetrics]
      >) {
        const winRate30d =
          metrics.returns_30d.length > 0
            ? (metrics.wins_30d / metrics.returns_30d.length) * 100
            : null;
        const winRate90d =
          metrics.returns_90d.length > 0
            ? (metrics.wins_90d / metrics.returns_90d.length) * 100
            : null;
        const avgReturn30d =
          metrics.returns_30d.length > 0
            ? metrics.returns_30d.reduce((a, b) => a + b, 0) /
              metrics.returns_30d.length
            : null;
        const avgReturn90d =
          metrics.returns_90d.length > 0
            ? metrics.returns_90d.reduce((a, b) => a + b, 0) /
              metrics.returns_90d.length
            : null;

        result[key] = {
          count: metrics.count,
          win_rate_30d:
            winRate30d !== null ? Math.round(winRate30d * 10) / 10 : null,
          win_rate_90d:
            winRate90d !== null ? Math.round(winRate90d * 10) / 10 : null,
          avg_return_30d:
            avgReturn30d !== null ? Math.round(avgReturn30d * 100) / 100 : null,
          avg_return_90d:
            avgReturn90d !== null ? Math.round(avgReturn90d * 100) / 100 : null,
        };
      }

      return result;
    };

    const categoryMetrics = formatCategoryMetrics(performanceByCategory);
    const strengthMetrics = formatCategoryMetrics(performanceByStrength);

    // Calculate overall metrics
    const overallWinRate30d =
      totalSignalsWithOutcome30d > 0
        ? (totalWins30d / totalSignalsWithOutcome30d) * 100
        : null;
    const overallWinRate90d =
      totalSignalsWithOutcome90d > 0
        ? (totalWins90d / totalSignalsWithOutcome90d) * 100
        : null;
    const overallAvgReturn30d =
      returns30d.length > 0
        ? returns30d.reduce((a, b) => a + b, 0) / returns30d.length
        : null;
    const overallAvgReturn90d =
      returns90d.length > 0
        ? returns90d.reduce((a, b) => a + b, 0) / returns90d.length
        : null;

    // Format response
    return NextResponse.json({
      symbol: symbolUpper,
      lookback_days: lookbackDays,
      min_strength: validStrength,
      min_confluence: minConfluence,
      signals_returned: filteredSignals.length,
      signals: filteredSignals.map((s: FibonacciSignalRecord) => ({
        id: s.id,
        timestamp: s.timestamp,
        signal: s.signal,
        category: s.category,
        strength: s.strength,
        confluenceScore: s.confluenceScore,
        priceAtSignal: s.priceAtSignal,
        levelPrice: s.levelPrice,
        levelName: s.levelName,
        multiTimeframeAligned: s.multiTimeframeAligned,
        outcomeReturnPercent30d: s.outcomeReturnPercent30d
          ? parseFloat(s.outcomeReturnPercent30d.toString())
          : null,
        outcomeReturnPercent90d: s.outcomeReturnPercent90d
          ? parseFloat(s.outcomeReturnPercent90d.toString())
          : null,
      })),
      performance: {
        by_category: categoryMetrics,
        by_strength: strengthMetrics,
        summary: {
          total_signals: filteredSignals.length,
          signals_with_30d_outcome: totalSignalsWithOutcome30d,
          signals_with_90d_outcome: totalSignalsWithOutcome90d,
          overall_win_rate_30d:
            overallWinRate30d !== null
              ? Math.round(overallWinRate30d * 10) / 10
              : null,
          overall_win_rate_90d:
            overallWinRate90d !== null
              ? Math.round(overallWinRate90d * 10) / 10
              : null,
          avg_return_30d:
            overallAvgReturn30d !== null
              ? Math.round(overallAvgReturn30d * 100) / 100
              : null,
          avg_return_90d:
            overallAvgReturn90d !== null
              ? Math.round(overallAvgReturn90d * 100) / 100
              : null,
        },
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Fibonacci history error:", {
      message: errorMessage,
      stack: errorStack,
    });

    return NextResponse.json(
      {
        error: "Failed to retrieve historical signal data",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    );
  }
}

/**
 * Performance metrics structure for aggregation
 */
interface PerformanceMetrics {
  count: number;
  wins_30d: number;
  wins_90d: number;
  returns_30d: number[];
  returns_90d: number[];
}

/**
 * Formatted metrics for response
 */
interface FormattedMetrics {
  count: number;
  win_rate_30d: number | null;
  win_rate_90d: number | null;
  avg_return_30d: number | null;
  avg_return_90d: number | null;
}
