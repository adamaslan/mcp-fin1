import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Info,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
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

function riskBadgeLabel(quality: PortfolioPosition["risk_quality"]): string {
  if (quality === "high") return "Tight";
  if (quality === "medium") return "Moderate";
  return "Wide";
}

function overallRiskClass(riskPct: number): string {
  if (riskPct <= 2) return "text-green-600";
  if (riskPct <= 5) return "text-yellow-600";
  if (riskPct <= 10) return "text-orange-600";
  return "text-red-600";
}

function overallRiskLabel(riskPct: number): string {
  if (riskPct <= 2) return "LOW";
  if (riskPct <= 5) return "MODERATE";
  if (riskPct <= 10) return "HIGH";
  return "CRITICAL";
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

function formatDate(isoStr?: string): string {
  if (!isoStr) return "N/A";
  try {
    return new Date(isoStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "N/A";
  }
}

interface PortfolioRiskDemoProps {
  data: PortfolioRiskData | null;
}

export function PortfolioRiskDemo({ data }: PortfolioRiskDemoProps) {
  const isLive = !!data;

  const totalValue = data?.total_value ?? 189782;
  const totalMaxLoss = data?.total_max_loss ?? 7974;
  const riskPct = data?.risk_percent_of_portfolio ?? 4.2;
  const seededAt = data?.seeded_at;

  const allPositions: PortfolioPosition[] = data?.positions
    ? [...data.positions].sort((a, b) => b.current_value - a.current_value)
    : [];

  // Show top 12 positions
  const positions = allPositions.slice(0, 12);
  const totalPositions = allPositions.length;

  // Risk quality distribution
  const highQuality = allPositions.filter(
    (p) => p.risk_quality === "high",
  ).length;
  const mediumQuality = allPositions.filter(
    (p) => p.risk_quality === "medium",
  ).length;
  const lowQuality = allPositions.filter(
    (p) => p.risk_quality === "low",
  ).length;

  // Sector concentration from positions
  const sectorMap: Record<string, number> = {};
  for (const pos of allPositions) {
    const sector = pos.sector || "Other";
    sectorMap[sector] = (sectorMap[sector] ?? 0) + pos.current_value;
  }
  const sectorEntries = Object.entries(sectorMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Average unrealized P&L %
  const avgPnlPct =
    allPositions.length > 0
      ? allPositions.reduce((sum, p) => sum + p.unrealized_percent * 100, 0) /
        allPositions.length
      : 0;

  return (
    <section className="py-16 border-t bg-muted/30">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-3">
            <ShieldCheck className="h-3 w-3" />
            {isLive ? "Live from Firebase" : "Demo Portfolio"}
            {isLive && seededAt && (
              <span className="text-muted-foreground ml-1">
                · Updated {formatDate(seededAt)}
              </span>
            )}
          </div>
          <h2 className="text-3xl font-bold mb-2">Portfolio Risk Engine</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Every position sized and scored — total exposure quantified at a
            glance. Stop-levels and max-loss calculated automatically using
            ATR-based volatility stops. Know exactly how much you can lose
            before a single stop is hit.
          </p>
        </div>

        {/* Summary cards — 6 stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 max-w-5xl mx-auto mb-8">
          <Card className="col-span-1">
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground mb-1">
                Portfolio Value
              </p>
              <p className="text-xl font-bold">{formatUsd(totalValue)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {totalPositions || "–"} positions
              </p>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground mb-1">Max Downside</p>
              <p className="text-xl font-bold text-red-500">
                −{formatUsd(totalMaxLoss)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                if all stops hit
              </p>
            </CardContent>
          </Card>

          <Card
            className={`col-span-1 border-${riskPct <= 5 ? "green" : riskPct <= 10 ? "orange" : "red"}-500/30`}
          >
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground mb-1">
                Portfolio Risk
              </p>
              <p className={`text-xl font-bold ${overallRiskClass(riskPct)}`}>
                {riskPct.toFixed(2)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {overallRiskLabel(riskPct)} risk level
              </p>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground mb-1">Avg P&amp;L</p>
              <p
                className={`text-xl font-bold ${avgPnlPct >= 0 ? "text-green-600" : "text-red-500"}`}
              >
                {formatPct(avgPnlPct)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">per position</p>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground mb-1">Tight Stops</p>
              <p className="text-xl font-bold text-green-600">{highQuality}</p>
              <p className="text-xs text-muted-foreground mt-1">
                disciplined risk
              </p>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground mb-1">Wide Stops</p>
              <p className="text-xl font-bold text-red-500">{lowQuality}</p>
              <p className="text-xs text-muted-foreground mt-1">review these</p>
            </CardContent>
          </Card>
        </div>

        {/* Risk distribution bar */}
        {totalPositions > 0 && (
          <div className="max-w-5xl mx-auto mb-8">
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    Risk Quality Distribution
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {totalPositions} total positions
                  </p>
                </div>
                {/* Visual bar */}
                <div className="h-3 rounded-full overflow-hidden flex mb-2">
                  {highQuality > 0 && (
                    <div
                      className="bg-green-500 h-full"
                      style={{
                        width: `${(highQuality / totalPositions) * 100}%`,
                      }}
                      title={`${highQuality} tight-stop positions`}
                    />
                  )}
                  {mediumQuality > 0 && (
                    <div
                      className="bg-yellow-400 h-full"
                      style={{
                        width: `${(mediumQuality / totalPositions) * 100}%`,
                      }}
                      title={`${mediumQuality} moderate-stop positions`}
                    />
                  )}
                  {lowQuality > 0 && (
                    <div
                      className="bg-red-400 h-full"
                      style={{
                        width: `${(lowQuality / totalPositions) * 100}%`,
                      }}
                      title={`${lowQuality} wide-stop positions`}
                    />
                  )}
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                    Tight ({highQuality})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-yellow-400" />
                    Moderate ({mediumQuality})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-red-400" />
                    Wide ({lowQuality})
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sector concentration + Positions table side by side on wide screens */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {/* Sector concentration */}
          {sectorEntries.length > 0 && (
            <Card className="lg:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Sector Concentration
                </CardTitle>
                <CardDescription className="text-xs">
                  Portfolio value by sector
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-2.5">
                  {sectorEntries.map(([sector, value]) => {
                    const pct = (value / totalValue) * 100;
                    return (
                      <div key={sector}>
                        <div className="flex items-center justify-between text-xs mb-0.5">
                          <span className="font-medium truncate max-w-[120px]">
                            {sector}
                          </span>
                          <span className="text-muted-foreground ml-2">
                            {pct.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary/60 rounded-full"
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Concentration risk: a single sector above 40% may need
                  hedging.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Positions table */}
          {positions.length > 0 && (
            <Card
              className={
                sectorEntries.length > 0 ? "lg:col-span-2" : "lg:col-span-3"
              }
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Top {positions.length} Positions by Value
                  {totalPositions > positions.length && (
                    <span className="text-muted-foreground font-normal text-xs ml-2">
                      (of {totalPositions} total)
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  ATR-based stop level and max-loss calculated per position
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
                        <th className="text-right px-4 py-2 font-medium text-muted-foreground hidden sm:table-cell">
                          Shares
                        </th>
                        <th className="text-right px-4 py-2 font-medium text-muted-foreground">
                          Value
                        </th>
                        <th className="text-right px-4 py-2 font-medium text-muted-foreground">
                          P&amp;L
                        </th>
                        <th className="text-right px-4 py-2 font-medium text-muted-foreground hidden md:table-cell">
                          Entry
                        </th>
                        <th className="text-right px-4 py-2 font-medium text-muted-foreground">
                          Stop
                        </th>
                        <th className="text-right px-4 py-2 font-medium text-muted-foreground">
                          Max Loss
                        </th>
                        <th className="text-center px-4 py-2 font-medium text-muted-foreground">
                          Stop Quality
                        </th>
                        <th className="text-center px-4 py-2 font-medium text-muted-foreground hidden sm:table-cell">
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
                          <td className="px-4 py-2.5 text-right text-muted-foreground hidden sm:table-cell">
                            {pos.shares.toFixed(2)}
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
                          <td className="px-4 py-2.5 text-right text-muted-foreground hidden md:table-cell">
                            ${pos.entry_price.toFixed(2)}
                          </td>
                          <td className="px-4 py-2.5 text-right text-muted-foreground">
                            ${pos.stop_level.toFixed(2)}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <span className="text-red-500">
                              −{formatUsd(pos.max_loss_dollar)}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">
                              ({pos.max_loss_percent.toFixed(1)}%)
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <Badge
                              variant="outline"
                              className={`text-xs ${riskBadgeClass(pos.risk_quality)}`}
                            >
                              {riskBadgeLabel(pos.risk_quality)}
                            </Badge>
                          </td>
                          <td className="px-4 py-2.5 text-center text-muted-foreground text-xs hidden sm:table-cell">
                            {pos.timeframe}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* How it works / Legend */}
        <div className="max-w-5xl mx-auto mb-10">
          <Card className="bg-muted/40 border-dashed">
            <CardContent className="pt-5 pb-5">
              <p className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                <Info className="h-4 w-4 text-muted-foreground" />
                How the Risk Engine Works
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground mb-1">
                    ATR Stop Level
                  </p>
                  <p>
                    Stop prices are calculated using Average True Range (ATR) —
                    a volatility measure. A tighter ATR stop means less capital
                    at risk per position.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">
                    Max Loss ($)
                  </p>
                  <p>
                    The dollar amount you would lose if the stock hits its stop
                    level. Formula: (current price − stop level) × shares.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">
                    Stop Quality
                  </p>
                  <p>
                    <span className="text-green-700 font-medium">Tight</span> =
                    stop within 5% of price (disciplined).{" "}
                    <span className="text-yellow-700 font-medium">
                      Moderate
                    </span>{" "}
                    = 5–10%.{" "}
                    <span className="text-red-600 font-medium">Wide</span> =
                    over 10% (review these).
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">
                    Timeframe
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Day</span> =
                    intraday trade.{" "}
                    <span className="font-medium text-foreground">Swing</span> =
                    multi-day hold.{" "}
                    <span className="font-medium text-foreground">
                      Position
                    </span>{" "}
                    = weeks/months-long investment.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border/50 flex items-start gap-2 text-xs text-muted-foreground">
                <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 mt-0.5 shrink-0" />
                <p>
                  <strong className="text-foreground">Rule of thumb:</strong>{" "}
                  Keep total portfolio risk (all max losses combined) below 5%
                  of portfolio value. This portfolio is at{" "}
                  <strong className={overallRiskClass(riskPct)}>
                    {riskPct.toFixed(2)}%
                  </strong>{" "}
                  —{" "}
                  {riskPct <= 5
                    ? "within the safe threshold."
                    : "above the recommended threshold — consider tightening stops."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <TrendingDown className="h-4 w-4 text-red-400" />
            {isLive
              ? "Live data from Firebase · Seeded from real portfolio"
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
