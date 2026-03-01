"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PortfolioPosition } from "@/lib/mcp/types";
import { AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";

interface RiskDistributionProps {
  positions: PortfolioPosition[];
  totalValue: number;
  totalMaxLoss: number;
}

export function RiskDistribution({
  positions,
  totalValue,
  totalMaxLoss,
}: RiskDistributionProps) {
  const lowRiskCount = positions.filter((p) => p.risk_level === "low").length;
  const moderateRiskCount = positions.filter(
    (p) => p.risk_level === "moderate"
  ).length;
  const highRiskCount = positions.filter((p) => p.risk_level === "high").length;

  const total = positions.length;
  const lowRiskPct = (lowRiskCount / total) * 100;
  const moderateRiskPct = (moderateRiskCount / total) * 100;
  const highRiskPct = (highRiskCount / total) * 100;

  // Calculate value allocation by risk level
  const lowRiskValue = positions
    .filter((p) => p.risk_level === "low")
    .reduce((acc, p) => acc + p.current_value, 0);
  const moderateRiskValue = positions
    .filter((p) => p.risk_level === "moderate")
    .reduce((acc, p) => acc + p.current_value, 0);
  const highRiskValue = positions
    .filter((p) => p.risk_level === "high")
    .reduce((acc, p) => acc + p.current_value, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Low Risk
            </CardTitle>
            <CardDescription className="text-xs">2-3% stop loss</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {lowRiskCount}
              </p>
              <p className="text-xs text-muted-foreground">{lowRiskPct.toFixed(0)}% of positions</p>
            </div>
            <div>
              <p className="text-sm font-medium">
                ${lowRiskValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-muted-foreground">
                {((lowRiskValue / totalValue) * 100).toFixed(1)}% of portfolio
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Moderate Risk
            </CardTitle>
            <CardDescription className="text-xs">3-5% stop loss</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {moderateRiskCount}
              </p>
              <p className="text-xs text-muted-foreground">{moderateRiskPct.toFixed(0)}% of positions</p>
            </div>
            <div>
              <p className="text-sm font-medium">
                ${moderateRiskValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-muted-foreground">
                {((moderateRiskValue / totalValue) * 100).toFixed(1)}% of portfolio
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              High Risk
            </CardTitle>
            <CardDescription className="text-xs">5-8% stop loss</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {highRiskCount}
              </p>
              <p className="text-xs text-muted-foreground">{highRiskPct.toFixed(0)}% of positions</p>
            </div>
            <div>
              <p className="text-sm font-medium">
                ${highRiskValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-muted-foreground">
                {((highRiskValue / totalValue) * 100).toFixed(1)}% of portfolio
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Distribution</CardTitle>
          <CardDescription>
            Position count and value allocation by risk level
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Position distribution */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Positions</h4>
            <div className="flex gap-1 h-8 rounded overflow-hidden">
              {lowRiskCount > 0 && (
                <div
                  className="bg-green-500 flex items-center justify-center text-xs font-bold text-white"
                  style={{ width: `${lowRiskPct}%` }}
                  title={`${lowRiskCount} positions (${lowRiskPct.toFixed(0)}%)`}
                >
                  {lowRiskPct > 10 && `${lowRiskCount}`}
                </div>
              )}
              {moderateRiskCount > 0 && (
                <div
                  className="bg-blue-500 flex items-center justify-center text-xs font-bold text-white"
                  style={{ width: `${moderateRiskPct}%` }}
                  title={`${moderateRiskCount} positions (${moderateRiskPct.toFixed(0)}%)`}
                >
                  {moderateRiskPct > 10 && `${moderateRiskCount}`}
                </div>
              )}
              {highRiskCount > 0 && (
                <div
                  className="bg-orange-500 flex items-center justify-center text-xs font-bold text-white"
                  style={{ width: `${highRiskPct}%` }}
                  title={`${highRiskCount} positions (${highRiskPct.toFixed(0)}%)`}
                >
                  {highRiskPct > 10 && `${highRiskCount}`}
                </div>
              )}
            </div>
            <div className="flex gap-4 mt-2 text-xs">
              <span className="flex items-center gap-1">
                <div className="h-2 w-2 bg-green-500 rounded-full" />
                {lowRiskCount} Low
              </span>
              <span className="flex items-center gap-1">
                <div className="h-2 w-2 bg-blue-500 rounded-full" />
                {moderateRiskCount} Moderate
              </span>
              <span className="flex items-center gap-1">
                <div className="h-2 w-2 bg-orange-500 rounded-full" />
                {highRiskCount} High
              </span>
            </div>
          </div>

          {/* Value distribution */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Portfolio Value</h4>
            <div className="flex gap-1 h-8 rounded overflow-hidden">
              {lowRiskValue > 0 && (
                <div
                  className="bg-green-500 flex items-center justify-center text-xs font-bold text-white"
                  style={{ width: `${(lowRiskValue / totalValue) * 100}%` }}
                  title={`$${lowRiskValue.toLocaleString("en-US", { maximumFractionDigits: 0 })} (${((lowRiskValue / totalValue) * 100).toFixed(0)}%)`}
                >
                  {(lowRiskValue / totalValue) * 100 > 10 && `${((lowRiskValue / totalValue) * 100).toFixed(0)}%`}
                </div>
              )}
              {moderateRiskValue > 0 && (
                <div
                  className="bg-blue-500 flex items-center justify-center text-xs font-bold text-white"
                  style={{ width: `${(moderateRiskValue / totalValue) * 100}%` }}
                  title={`$${moderateRiskValue.toLocaleString("en-US", { maximumFractionDigits: 0 })} (${((moderateRiskValue / totalValue) * 100).toFixed(0)}%)`}
                >
                  {(moderateRiskValue / totalValue) * 100 > 10 && `${((moderateRiskValue / totalValue) * 100).toFixed(0)}%`}
                </div>
              )}
              {highRiskValue > 0 && (
                <div
                  className="bg-orange-500 flex items-center justify-center text-xs font-bold text-white"
                  style={{ width: `${(highRiskValue / totalValue) * 100}%` }}
                  title={`$${highRiskValue.toLocaleString("en-US", { maximumFractionDigits: 0 })} (${((highRiskValue / totalValue) * 100).toFixed(0)}%)`}
                >
                  {(highRiskValue / totalValue) * 100 > 10 && `${((highRiskValue / totalValue) * 100).toFixed(0)}%`}
                </div>
              )}
            </div>
            <div className="flex gap-4 mt-2 text-xs">
              <span className="flex items-center gap-1">
                <div className="h-2 w-2 bg-green-500 rounded-full" />
                ${lowRiskValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </span>
              <span className="flex items-center gap-1">
                <div className="h-2 w-2 bg-blue-500 rounded-full" />
                ${moderateRiskValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </span>
              <span className="flex items-center gap-1">
                <div className="h-2 w-2 bg-orange-500 rounded-full" />
                ${highRiskValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Level Explanation */}
      <Card className="bg-muted/40">
        <CardHeader>
          <CardTitle className="text-base">Understanding Risk Levels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <div className="flex items-center gap-2 font-medium text-green-700 dark:text-green-400 mb-1">
              <CheckCircle2 className="h-4 w-4" />
              Low Risk (2-3% stops)
            </div>
            <p className="text-muted-foreground ml-6">
              Blue-chip companies with stable earnings and long history. Examples: AAPL, MSFT, JPM
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 font-medium text-blue-700 dark:text-blue-400 mb-1">
              <TrendingUp className="h-4 w-4" />
              Moderate Risk (3-5% stops)
            </div>
            <p className="text-muted-foreground ml-6">
              Established companies with some volatility. Examples: ORCL, UBER, GOOG
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 font-medium text-orange-700 dark:text-orange-400 mb-1">
              <AlertTriangle className="h-4 w-4" />
              High Risk (5-8% stops)
            </div>
            <p className="text-muted-foreground ml-6">
              Growth stocks with high volatility. Examples: TSLA, META, NVDA
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
