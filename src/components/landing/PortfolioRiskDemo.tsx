import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, TrendingDown } from "lucide-react";
import type {
  PortfolioRiskData,
  PortfolioPosition,
} from "@/lib/firebase/types";

function riskBadgeClass(quality: PortfolioPosition["risk_quality"]): string {
  if (quality === "high")
    return "bg-green-500/15 text-green-700 border-green-500/30";
  if (quality === "medium")
    return "bg-yellow-500/15 text-yellow-700 border-yellow-500/30";
  return "bg-red-500/15 text-red-700 border-red-500/30";
}

function formatUsd(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function formatPct(n: number): string {
  return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
}

interface PortfolioRiskDemoProps {
  data: PortfolioRiskData | null;
}

export function PortfolioRiskDemo({ data }: PortfolioRiskDemoProps) {
  const isLive = !!data;

  const totalValue = data?.total_value ?? 189782;
  const totalMaxLoss = data?.total_max_loss ?? 7974;
  const riskPct = data?.risk_percent_of_portfolio ?? 4.2;

  // Show top 8 positions sorted by current_value desc
  const positions: PortfolioPosition[] = data?.positions
    ? [...data.positions]
        .sort((a, b) => b.current_value - a.current_value)
        .slice(0, 8)
    : [];

  return (
    <section className="py-16 border-t bg-muted/30">
      <div className="container">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-3">
            <ShieldCheck className="h-3 w-3" />
            {isLive ? "Live from Firebase" : "Demo Portfolio"}
          </div>
          <h2 className="text-3xl font-bold mb-2">Portfolio Risk Engine</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Every position sized and scored — total exposure quantified at a
            glance. Stop-levels and max-loss calculated automatically.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10">
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground mb-1">
                Portfolio Value
              </p>
              <p className="text-2xl font-bold">{formatUsd(totalValue)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {positions.length || data?.positions?.length || "–"} positions
                tracked
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground mb-1">
                Max Downside Risk
              </p>
              <p className="text-2xl font-bold text-red-500">
                −{formatUsd(totalMaxLoss)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                if all stops hit today
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-500/30">
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground mb-1">
                Risk % of Portfolio
              </p>
              <p className="text-2xl font-bold text-green-600">
                {riskPct.toFixed(2)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                within 5% threshold
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Positions table */}
        {positions.length > 0 && (
          <div className="max-w-5xl mx-auto">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Top Positions by Value
                </CardTitle>
                <CardDescription>
                  Stop-level and max-loss calculated per position
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                          Symbol
                        </th>
                        <th className="text-right px-4 py-2 font-medium text-muted-foreground">
                          Value
                        </th>
                        <th className="text-right px-4 py-2 font-medium text-muted-foreground">
                          P&L
                        </th>
                        <th className="text-right px-4 py-2 font-medium text-muted-foreground">
                          Stop
                        </th>
                        <th className="text-right px-4 py-2 font-medium text-muted-foreground">
                          Max Loss
                        </th>
                        <th className="text-right px-4 py-2 font-medium text-muted-foreground">
                          Risk %
                        </th>
                        <th className="text-center px-4 py-2 font-medium text-muted-foreground">
                          Quality
                        </th>
                        <th className="text-center px-4 py-2 font-medium text-muted-foreground">
                          TF
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {positions.map((pos) => (
                        <tr
                          key={pos.symbol}
                          className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-2.5 font-semibold">
                            {pos.symbol}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            {formatUsd(pos.current_value)}
                          </td>
                          <td
                            className={`px-4 py-2.5 text-right font-medium ${
                              pos.unrealized_pnl >= 0
                                ? "text-green-600"
                                : "text-red-500"
                            }`}
                          >
                            {formatPct(pos.unrealized_percent * 100)}
                          </td>
                          <td className="px-4 py-2.5 text-right text-muted-foreground">
                            ${pos.stop_level.toFixed(2)}
                          </td>
                          <td className="px-4 py-2.5 text-right text-red-500">
                            −{formatUsd(pos.max_loss_dollar)}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            {pos.max_loss_percent.toFixed(1)}%
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <Badge
                              variant="outline"
                              className={`text-xs ${riskBadgeClass(pos.risk_quality)}`}
                            >
                              {pos.risk_quality}
                            </Badge>
                          </td>
                          <td className="px-4 py-2.5 text-center text-muted-foreground text-xs">
                            {pos.timeframe}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <TrendingDown className="h-4 w-4 text-red-400" />
            {isLive
              ? "Live data from Firebase · Updated in real-time"
              : "Connect your portfolio to see live risk calculations"}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="gap-2">
              <a href="/sign-up">
                Analyze My Portfolio
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#tools">See All Tools</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
