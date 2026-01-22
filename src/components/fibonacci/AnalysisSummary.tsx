"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import type { FibonacciAnalysisResult } from "@/lib/mcp/types";

interface AnalysisSummaryProps {
  result: FibonacciAnalysisResult;
}

function getStrengthColor(strength: string): string {
  switch (strength?.toUpperCase()) {
    case "VERY_STRONG":
      return "bg-amber-500/20 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-800";
    case "STRONG":
      return "bg-blue-500/20 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-800";
    case "SIGNIFICANT":
      return "bg-purple-500/20 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-800";
    case "MODERATE":
      return "bg-gray-500/20 text-gray-700 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-800";
    case "WEAK":
      return "bg-gray-400/20 text-gray-600 border-gray-200 dark:bg-gray-400/10 dark:text-gray-400 dark:border-gray-800";
    default:
      return "bg-gray-500/20 text-gray-700 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-800";
  }
}

function getRatingLabel(avgScore: number): { label: string; color: string } {
  if (avgScore >= 80)
    return { label: "Excellent", color: "text-green-600 dark:text-green-400" };
  if (avgScore >= 60)
    return { label: "Good", color: "text-blue-600 dark:text-blue-400" };
  if (avgScore >= 40)
    return { label: "Fair", color: "text-yellow-600 dark:text-yellow-400" };
  return { label: "Poor", color: "text-red-600 dark:text-red-400" };
}

export function AnalysisSummary({ result }: AnalysisSummaryProps) {
  const avgConfluenceScore =
    result.confluenceZones.length > 0
      ? Math.round(
          result.confluenceZones.reduce(
            (sum, z) => sum + z.confluenceScore,
            0,
          ) / result.confluenceZones.length,
        )
      : 0;

  const highConfidenceZones = result.confluenceZones.filter(
    (z) => z.confluenceScore >= 60,
  ).length;

  const rating = getRatingLabel(avgConfluenceScore);

  const multiTimeframeAlignments = result.confluenceZones.reduce(
    (sum, z) => sum + z.multiTimeframeAligned,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Signals Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Total Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {result.summary.totalSignals}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Object.entries(result.summary.byCategory || {}).map(
                ([cat, count]) => (
                  <span key={cat} className="block">
                    {cat}: {count}
                  </span>
                ),
              )}
            </p>
          </CardContent>
        </Card>

        {/* High-Confidence Zones Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              High-Confidence Zones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highConfidenceZones}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Of {result.confluenceZones.length} total zones
            </p>
          </CardContent>
        </Card>

        {/* Average Confluence Score Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Confluence Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgConfluenceScore}</div>
            <p className={cn("text-xs font-medium mt-1", rating.color)}>
              {rating.label}
            </p>
          </CardContent>
        </Card>

        {/* Multi-Timeframe Alignments Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Timeframe Alignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{multiTimeframeAlignments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Multi-timeframe confirmed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Swing Range Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Swing Range Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Range bars */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Price Range</span>
                  <span className="text-xs text-muted-foreground">
                    ${result.swingLow.toFixed(2)} - $
                    {result.swingHigh.toFixed(2)}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/60"
                    style={{
                      width: "100%",
                    }}
                  />
                </div>
              </div>

              {/* Current Price Position */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Current Price</span>
                  <span className="text-sm font-bold">
                    ${result.price.toFixed(2)}
                  </span>
                </div>
                <div className="h-6 bg-muted rounded-md overflow-hidden relative">
                  <div
                    className="absolute top-0 h-full w-1 bg-primary"
                    style={{
                      left: `${
                        ((result.price - result.swingLow) /
                          (result.swingHigh - result.swingLow)) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>

              {/* Swing Range Stats */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground">Range</div>
                  <div className="text-lg font-bold">
                    ${result.swingRange.toFixed(2)}
                  </div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground">% Range</div>
                  <div className="text-lg font-bold">
                    {(
                      ((result.swingHigh - result.swingLow) / result.swingLow) *
                      100
                    ).toFixed(2)}
                    %
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="text-base">Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground">
              Confluence zones detected
            </span>
            <span className="font-semibold">
              {result.confluenceZones.length}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground">
              Strong support/resistance areas
            </span>
            <Badge
              variant="outline"
              className={cn("border", getStrengthColor("STRONG"))}
            >
              {
                result.confluenceZones.filter((z) => z.strength === "STRONG")
                  .length
              }
            </Badge>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">
              Multi-timeframe confirmation
            </span>
            <Badge
              variant="outline"
              className={cn(
                "border",
                multiTimeframeAlignments > 3
                  ? "bg-green-500/20 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-800"
                  : "bg-yellow-500/20 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-800",
              )}
            >
              {multiTimeframeAlignments} zones
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tier Gating Notice */}
      {result.tierLimit && (
        <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 dark:text-blue-400 mt-1">ℹ️</div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-semibold mb-1">Pro/Max Feature</p>
                <p>
                  This analysis shows {result.tierLimit.signalsShown} of{" "}
                  {result.tierLimit.signalsTotal} available signals.{" "}
                  <a
                    href="/pricing"
                    className="underline font-medium hover:opacity-80"
                  >
                    Upgrade to see all signals and zones
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
