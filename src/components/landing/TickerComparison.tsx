import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react";

interface ComparisonEntry {
  symbol: string;
  score: number;
  bullish: number;
  bearish: number;
  price: number;
  change: number;
}

function getScoreBadge(score: number): { label: string; className: string } {
  if (score >= 70) return { label: "Strong Buy", className: "bg-green-500" };
  if (score >= 55) return { label: "Bullish", className: "bg-green-600" };
  if (score >= 45) return { label: "Neutral", className: "bg-gray-500" };
  if (score >= 30) return { label: "Bearish", className: "bg-red-600" };
  return { label: "Strong Sell", className: "bg-red-500" };
}

export function TickerComparison({
  comparison,
  featuredTickers,
}: {
  comparison?: ComparisonEntry[] | null;
  featuredTickers?: string[];
}) {
  const hasData = comparison && comparison.length > 0;
  const tickers = featuredTickers || [
    "MU",
    "SNDK",
    "GLD",
    "GLW",
    "GOOG",
    "IBIT",
  ];

  return (
    <div className="container">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">
          {hasData ? "Live Ticker Comparison" : "Compare Any Tickers Instantly"}
        </h2>
        <p className="text-muted-foreground">
          {hasData
            ? `Real-time signal analysis across ${tickers.join(", ")}`
            : "Run head-to-head comparisons on signal strength, momentum, and risk"}
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {hasData
                  ? `${tickers.length} Tickers Compared`
                  : "Featured Watchlist"}
              </span>
              {hasData && (
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-500/30 bg-green-500/10"
                >
                  Live Data
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-3 pr-4">Ticker</th>
                    <th className="text-right py-3 px-4">Price</th>
                    <th className="text-right py-3 px-4">Change</th>
                    <th className="text-center py-3 px-4">Bullish</th>
                    <th className="text-center py-3 px-4">Bearish</th>
                    <th className="text-right py-3 px-4">Score</th>
                    <th className="text-center py-3 pl-4">Signal</th>
                  </tr>
                </thead>
                <tbody>
                  {hasData
                    ? comparison.map((entry, i) => {
                        const badge = getScoreBadge(entry.score);
                        const isPositive = entry.change >= 0;
                        return (
                          <tr
                            key={entry.symbol}
                            className={`border-b last:border-b-0 ${i === 0 ? "bg-primary/5" : ""}`}
                          >
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-2">
                                <span className="font-bold">
                                  {entry.symbol}
                                </span>
                                {i === 0 && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] px-1.5 py-0 text-primary border-primary/30"
                                  >
                                    #1
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="text-right py-3 px-4 font-mono">
                              ${entry.price.toFixed(2)}
                            </td>
                            <td className="text-right py-3 px-4">
                              <div className="flex items-center justify-end gap-1">
                                {isPositive ? (
                                  <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                                ) : (
                                  <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                                )}
                                <span
                                  className={`font-mono ${isPositive ? "text-green-500" : "text-red-500"}`}
                                >
                                  {isPositive ? "+" : ""}
                                  {entry.change.toFixed(2)}%
                                </span>
                              </div>
                            </td>
                            <td className="text-center py-3 px-4 text-green-500 font-semibold">
                              {entry.bullish}
                            </td>
                            <td className="text-center py-3 px-4 text-red-500 font-semibold">
                              {entry.bearish}
                            </td>
                            <td className="text-right py-3 px-4 font-bold">
                              {entry.score.toFixed(0)}
                            </td>
                            <td className="text-center py-3 pl-4">
                              <Badge
                                className={`${badge.className} text-white text-xs`}
                              >
                                {badge.label}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })
                    : tickers.map((ticker) => (
                        <tr key={ticker} className="border-b last:border-b-0">
                          <td className="py-3 pr-4 font-bold">{ticker}</td>
                          <td className="text-right py-3 px-4 text-muted-foreground">
                            [Price]
                          </td>
                          <td className="text-right py-3 px-4 text-muted-foreground">
                            [Change]
                          </td>
                          <td className="text-center py-3 px-4 text-muted-foreground">
                            --
                          </td>
                          <td className="text-center py-3 px-4 text-muted-foreground">
                            --
                          </td>
                          <td className="text-right py-3 px-4 text-muted-foreground">
                            --
                          </td>
                          <td className="text-center py-3 pl-4">
                            <Badge variant="outline" className="text-xs">
                              Pending
                            </Badge>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {hasData ? (
                  <>
                    Ranked by signal score across 150+ technical indicators.
                    {comparison[0] && (
                      <>
                        {" "}
                        <span className="font-semibold text-foreground">
                          {comparison[0].symbol}
                        </span>{" "}
                        leads with a score of {comparison[0].score.toFixed(0)}.
                      </>
                    )}
                  </>
                ) : (
                  <>
                    Compare any set of stocks with real-time signal analysis.
                    See bullish/bearish counts, scores, and rankings.
                  </>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Button asChild size="lg" className="gap-2">
            <a href="/sign-up">
              Compare Your Own Tickers
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
