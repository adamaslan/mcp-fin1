"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import type { FibonacciAnalysisResult, ConfluenceZone } from "@/lib/mcp/types";

interface ConfluenceZonesCardProps {
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

function getStrengthBgColor(strength: string): string {
  switch (strength?.toUpperCase()) {
    case "VERY_STRONG":
      return "bg-gradient-to-r from-amber-500/10 to-amber-400/5 border-l-4 border-l-amber-500";
    case "STRONG":
      return "bg-gradient-to-r from-blue-500/10 to-blue-400/5 border-l-4 border-l-blue-500";
    case "SIGNIFICANT":
      return "bg-gradient-to-r from-purple-500/10 to-purple-400/5 border-l-4 border-l-purple-500";
    case "MODERATE":
      return "bg-gradient-to-r from-gray-500/10 to-gray-400/5 border-l-4 border-l-gray-500";
    default:
      return "bg-muted border-l-4 border-l-muted-foreground";
  }
}

function ConfluenceZoneRow({
  zone,
  index,
}: {
  zone: ConfluenceZone;
  index: number;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(zone.price.toFixed(2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "p-4 rounded-lg transition-all hover:shadow-md border",
        getStrengthBgColor(zone.strength),
      )}
    >
      {/* Header: Rank, Price, and Copy Button */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold">
            {index + 1}
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Zone
            </div>
            <div className="text-lg font-bold">${zone.price.toFixed(2)}</div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 w-8 p-0"
          title="Copy price to clipboard"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>

      {/* Level name and confluence score */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-border/30">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-sm font-medium">{zone.levelName}</span>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Score</div>
          <div className="text-lg font-bold text-primary">
            {zone.confluenceScore}
          </div>
        </div>
      </div>

      {/* Strength badge and stats */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <Badge
            variant="outline"
            className={cn("border", getStrengthColor(zone.strength))}
          >
            {zone.strength}
          </Badge>
          {zone.multiTimeframeAligned > 0 && (
            <Badge
              variant="outline"
              className="bg-green-500/20 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-800"
            >
              {zone.multiTimeframeAligned}TF
            </Badge>
          )}
        </div>

        {/* Signal stats row */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/30">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Signals</div>
            <div className="text-sm font-semibold">{zone.signalCount}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Avg Strength</div>
            <div className="text-sm font-semibold">
              {zone.averageSignalStrength.toFixed(1)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">TF Aligned</div>
            <div className="text-sm font-semibold">
              {zone.multiTimeframeAligned}
            </div>
          </div>
        </div>

        {/* Signal categories */}
        {zone.signalCategories.length > 0 && (
          <div className="pt-2 border-t border-border/30">
            <div className="text-xs text-muted-foreground mb-1">
              Signal Types
            </div>
            <div className="flex flex-wrap gap-1">
              {zone.signalCategories.slice(0, 5).map((category, idx) => (
                <Badge key={idx} variant="outline" className="text-xs py-0.5">
                  {category}
                </Badge>
              ))}
              {zone.signalCategories.length > 5 && (
                <Badge variant="outline" className="text-xs py-0.5">
                  +{zone.signalCategories.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ConfluenceZonesCard({ result }: ConfluenceZonesCardProps) {
  const sortedZones = [...result.confluenceZones].sort(
    (a, b) => b.confluenceScore - a.confluenceScore,
  );

  const topZones = sortedZones.slice(0, 10);

  const highConfidenceZones = result.confluenceZones.filter(
    (z) => z.confluenceScore >= 60,
  );

  if (topZones.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Confluence Zones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-muted-foreground">
              <p className="mb-2">No confluence zones detected</p>
              <p className="text-sm">
                Confluence zones appear when multiple Fibonacci levels converge
                at similar price levels
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Confluence Zones</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {topZones.length} zones shown
              {highConfidenceZones.length > 0 &&
                ` • ${highConfidenceZones.length} high-confidence`}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topZones.map((zone, index) => (
            <ConfluenceZoneRow
              key={`${zone.price}-${index}`}
              zone={zone}
              index={index}
            />
          ))}

          {result.confluenceZones.length > 10 && (
            <div className="p-3 bg-muted/50 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">
                Showing top 10 of {result.confluenceZones.length} zones
              </p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-border/50">
          <p className="text-xs font-medium text-muted-foreground mb-3">
            Strength Scale
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <div className="text-xs">
              <Badge
                variant="outline"
                className={cn(
                  "border w-full justify-center",
                  getStrengthColor("VERY_STRONG"),
                )}
              >
                Very Strong
              </Badge>
            </div>
            <div className="text-xs">
              <Badge
                variant="outline"
                className={cn(
                  "border w-full justify-center",
                  getStrengthColor("STRONG"),
                )}
              >
                Strong
              </Badge>
            </div>
            <div className="text-xs">
              <Badge
                variant="outline"
                className={cn(
                  "border w-full justify-center",
                  getStrengthColor("SIGNIFICANT"),
                )}
              >
                Significant
              </Badge>
            </div>
            <div className="text-xs">
              <Badge
                variant="outline"
                className={cn(
                  "border w-full justify-center",
                  getStrengthColor("MODERATE"),
                )}
              >
                Moderate
              </Badge>
            </div>
            <div className="text-xs">
              <Badge
                variant="outline"
                className={cn(
                  "border w-full justify-center",
                  getStrengthColor("WEAK"),
                )}
              >
                Weak
              </Badge>
            </div>
          </div>
        </div>

        {/* Tier Gating Notice */}
        {result.tierLimit &&
          typeof result.tierLimit.signalsTotal === "number" &&
          result.tierLimit.signalsShown < result.tierLimit.signalsTotal && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <span className="font-semibold">Pro/Max Feature:</span> Upgrade
                to see all {result.tierLimit.signalsTotal} zones
              </p>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
