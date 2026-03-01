"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  SectorSummary,
  PortfolioPosition,
  SectorRiskDistribution,
} from "@/lib/mcp/types";
import {
  ChevronDown,
  ChevronUp,
  TrendingDown,
  AlertTriangle,
  Shield,
} from "lucide-react";

interface SectorBreakdownProps {
  sectors: Record<string, SectorSummary>;
  sectorConcentration: Record<string, number>;
  totalPortfolioValue: number;
}

const riskColors = {
  low: "bg-green-500/10 text-green-700 dark:text-green-400",
  moderate: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  high: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
};

const stopLossColorClass = (stopPercent: number) => {
  if (stopPercent <= 3) return "text-green-600 dark:text-green-400";
  if (stopPercent <= 5) return "text-blue-600 dark:text-blue-400";
  return "text-orange-600 dark:text-orange-400";
};

export function SectorBreakdown({
  sectors,
  sectorConcentration,
  totalPortfolioValue,
}: SectorBreakdownProps) {
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(
    new Set([Object.keys(sectors)[0]]) // Expand first sector by default
  );

  const toggleSector = (sector: string) => {
    const newExpanded = new Set(expandedSectors);
    if (newExpanded.has(sector)) {
      newExpanded.delete(sector);
    } else {
      newExpanded.add(sector);
    }
    setExpandedSectors(newExpanded);
  };

  const getRiskLevelBadgeColor = (distribution: SectorRiskDistribution) => {
    const { high_risk_count, moderate_risk_count, low_risk_count } =
      distribution;
    const total = high_risk_count + moderate_risk_count + low_risk_count;
    const highRiskPercent = high_risk_count / total;

    if (highRiskPercent > 0.5) return "bg-orange-500/10 text-orange-700 dark:text-orange-400";
    if (highRiskPercent > 0.25) return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
    return "bg-green-500/10 text-green-700 dark:text-green-400";
  };

  return (
    <div className="space-y-4">
      {/* Sector Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Top Risk Sector</p>
              <p className="font-semibold">
                {Object.entries(sectorConcentration).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A"}
              </p>
              <p className="text-xs text-muted-foreground">
                {Object.entries(sectorConcentration).sort(([, a], [, b]) => b - a)[0]?.[1]?.toFixed(1)}% of portfolio
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Sector Count</p>
              <p className="font-semibold text-xl">{Object.keys(sectors).length}</p>
              <p className="text-xs text-muted-foreground">sectors represented</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Total Positions</p>
              <p className="font-semibold text-xl">
                {Object.values(sectors).reduce((acc, s) => acc + s.position_count, 0)}
              </p>
              <p className="text-xs text-muted-foreground">across all sectors</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Avg Stop Loss</p>
              <p className="font-semibold text-xl">
                {(
                  Object.values(sectors).reduce(
                    (acc, s) => acc + s.metrics.avg_stop_loss_percent,
                    0
                  ) / Object.keys(sectors).length
                ).toFixed(1)}
                %
              </p>
              <p className="text-xs text-muted-foreground">portfolio-wide</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sectors */}
      <div className="space-y-3">
        {Object.entries(sectors).map(([sectorName, sectorData]) => (
          <Card
            key={sectorName}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => toggleSector(sectorName)}
          >
            <div className="flex items-start justify-between p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-base">{sectorName}</h3>
                  <Badge
                    className={getRiskLevelBadgeColor(sectorData.risk_distribution)}
                  >
                    {sectorData.position_count} positions
                  </Badge>
                </div>

                {/* Sector metrics bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-muted-foreground text-xs">Value</p>
                    <p className="font-medium">
                      ${sectorData.total_value.toLocaleString("en-US", {
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">% Portfolio</p>
                    <p className="font-medium">
                      {sectorData.percent_of_portfolio.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Max Loss</p>
                    <p className="font-medium text-red-600 dark:text-red-400">
                      ${sectorData.metrics.total_max_loss_dollar.toLocaleString("en-US", {
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Avg Stop</p>
                    <p className={`font-medium ${stopLossColorClass(sectorData.metrics.avg_stop_loss_percent)}`}>
                      {sectorData.metrics.avg_stop_loss_percent.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Risk distribution */}
                <div className="flex items-center gap-2 text-xs mb-2">
                  <Shield className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-green-700 dark:text-green-400">
                    {sectorData.risk_distribution.low_risk_count} low
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-blue-700 dark:text-blue-400">
                    {sectorData.risk_distribution.moderate_risk_count} moderate
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-orange-700 dark:text-orange-400">
                    {sectorData.risk_distribution.high_risk_count} high
                  </span>
                  {sectorData.hedge_etf && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">Hedge: {sectorData.hedge_etf}</span>
                    </>
                  )}
                </div>

                {/* Concentration bar */}
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div
                    className="bg-primary rounded-full h-1.5 transition-all"
                    style={{
                      width: `${Math.min(sectorData.percent_of_portfolio, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <button
                className="ml-4 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSector(sectorName);
                }}
              >
                {expandedSectors.has(sectorName) ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Expanded positions */}
            {expandedSectors.has(sectorName) && (
              <CardContent className="border-t pt-4">
                <div className="space-y-2">
                  {sectorData.positions.slice(0, 10).map((pos) => (
                    <PositionRow key={pos.symbol} position={pos} />
                  ))}
                  {sectorData.positions.length > 10 && (
                    <p className="text-xs text-muted-foreground p-2">
                      ... and {sectorData.positions.length - 10} more positions
                    </p>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function PositionRow({ position }: { position: PortfolioPosition }) {
  return (
    <div className="flex items-center justify-between p-2 bg-muted/40 rounded text-sm">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold w-16">{position.symbol}</span>
          <Badge
            className={`${riskColors[position.risk_level || "moderate"]} text-xs`}
          >
            {position.risk_level}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {position.shares.toFixed(2)} shares @ ${position.current_price.toFixed(2)}
        </p>
      </div>
      <div className="text-right ml-4 flex-shrink-0">
        <p className="font-medium">
          ${position.current_value.toLocaleString("en-US", {
            maximumFractionDigits: 0,
          })}
        </p>
        <p className={`text-xs ${stopLossColorClass(position.stop_loss_percent || 0)}`}>
          Stop: ${position.stop_level.toFixed(2)} ({(position.stop_loss_percent || 0).toFixed(1)}%)
        </p>
        <p className="text-xs text-red-600 dark:text-red-400">
          -${position.max_loss_dollar.toFixed(0)}
        </p>
      </div>
    </div>
  );
}
