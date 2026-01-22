"use client";

import { PortfolioRiskResult, PortfolioPosition } from "@/lib/mcp/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HedgeSuggestions } from "./HedgeSuggestions";
import { AlertCircle, TrendingUp } from "lucide-react";

interface RiskDashboardProps {
  riskData: PortfolioRiskResult;
}

const riskLevelColors = {
  LOW: "bg-green-500/10 text-green-700 dark:text-green-400",
  MEDIUM: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  HIGH: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  CRITICAL: "bg-red-500/10 text-red-700 dark:text-red-400",
};

export function RiskDashboard({ riskData }: RiskDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ${riskData.total_value.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {riskData.positions.length} positions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Max Loss
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-500">
              ${riskData.total_max_loss.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {riskData.risk_percent_of_portfolio.toFixed(1)}% of portfolio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              className={`${riskLevelColors[riskData.overall_risk_level]} text-base`}
            >
              {riskData.overall_risk_level}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Risk Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {(riskData.risk_percent_of_portfolio / 100).toFixed(2)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              of total capital
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk alert */}
      {riskData.overall_risk_level === "CRITICAL" ||
        (riskData.overall_risk_level === "HIGH" && (
          <Card className="bg-red-500/10 border-red-200 dark:border-red-800">
            <CardContent className="pt-6 flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-700 dark:text-red-400">
                  High Portfolio Risk
                </p>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  Your portfolio risk exceeds recommended levels. Consider
                  reducing position sizes or hedging.
                </p>
              </div>
            </CardContent>
          </Card>
        ))}

      {/* Positions table */}
      <Card>
        <CardHeader>
          <CardTitle>Open Positions</CardTitle>
          <CardDescription>Individual position risk breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-3 font-semibold">Symbol</th>
                  <th className="text-right py-3 font-semibold">Shares</th>
                  <th className="text-right py-3 font-semibold">Entry Price</th>
                  <th className="text-right py-3 font-semibold">
                    Current Price
                  </th>
                  <th className="text-right py-3 font-semibold">
                    Current Value
                  </th>
                  <th className="text-right py-3 font-semibold">Max Loss</th>
                  <th className="text-center py-3 font-semibold">Quality</th>
                </tr>
              </thead>
              <tbody>
                {riskData.positions.map((position, idx) => (
                  <tr
                    key={idx}
                    className="border-b last:border-b-0 hover:bg-muted/50"
                  >
                    <td className="py-3 font-semibold">{position.symbol}</td>
                    <td className="text-right">{position.shares.toFixed(2)}</td>
                    <td className="text-right">
                      ${position.entry_price.toFixed(2)}
                    </td>
                    <td className="text-right">
                      ${position.current_price.toFixed(2)}
                    </td>
                    <td className="text-right font-medium">
                      ${position.current_value.toFixed(2)}
                    </td>
                    <td className="text-right text-red-500">
                      ${position.max_loss_dollar.toFixed(2)} (-
                      {position.max_loss_percent.toFixed(1)}%)
                    </td>
                    <td className="text-center">
                      <Badge
                        className={
                          position.risk_quality === "high"
                            ? "bg-green-500"
                            : position.risk_quality === "medium"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }
                      >
                        {position.risk_quality.toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Sector concentration */}
      {Object.keys(riskData.sector_concentration).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sector Concentration</CardTitle>
            <CardDescription>Portfolio exposure by sector</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(riskData.sector_concentration).map(
                ([sector, percentage]) => (
                  <div key={sector}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{sector}</p>
                      <p className="text-sm font-semibold">
                        {percentage.toFixed(1)}%
                      </p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hedge suggestions (Max tier only) */}
      {(riskData as any).hedge_suggestions &&
        (riskData as any).hedge_suggestions.length > 0 && (
          <HedgeSuggestions suggestions={(riskData as any).hedge_suggestions} />
        )}
    </div>
  );
}
