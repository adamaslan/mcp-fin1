"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import type { WatchlistSignal } from "@/lib/mcp/types";

interface WatchlistSignalsCardProps {
  signals: WatchlistSignal[];
}

export function WatchlistSignalsCard({ signals }: WatchlistSignalsCardProps) {
  const getActionColor = (action: string) => {
    switch (action) {
      case "BUY":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "HOLD":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "AVOID":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      default:
        return "";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "TRADE":
        return "text-green-600 dark:text-green-400";
      case "HOLD":
        return "text-yellow-600 dark:text-yellow-400";
      case "AVOID":
        return "text-red-600 dark:text-red-400";
      default:
        return "";
    }
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return "text-green-600 dark:text-green-400";
    if (change < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  return (
    <Card data-testid="watchlist-signals-card">
      <CardHeader>
        <CardTitle>Watchlist Signals</CardTitle>
      </CardHeader>
      <CardContent>
        {signals.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No signals in watchlist
          </p>
        ) : (
          <div className="space-y-2">
            {signals.map((signal) => (
              <Link key={signal.symbol} href={`/analyze/${signal.symbol}`}>
                <div
                  data-testid="watchlist-signal"
                  className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {signal.symbol}
                      </h3>
                    </div>
                    <Badge className={getActionColor(signal.action)}>
                      {signal.action}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-2">
                    {/* Price & Change */}
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Price
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        ${signal.price.toFixed(2)}
                      </p>
                    </div>

                    {/* Change % */}
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Change
                      </p>
                      <div
                        className={`text-sm font-semibold flex items-center gap-1 ${getPriceChangeColor(signal.change_percent)}`}
                      >
                        {signal.change_percent > 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : signal.change_percent < 0 ? (
                          <TrendingDown className="h-4 w-4" />
                        ) : null}
                        {signal.change_percent > 0 ? "+" : ""}
                        {signal.change_percent.toFixed(2)}%
                      </div>
                    </div>

                    {/* Risk Assessment */}
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Risk
                      </p>
                      <p
                        className={`text-sm font-semibold ${getRiskColor(signal.risk_assessment)}`}
                      >
                        {signal.risk_assessment}
                      </p>
                    </div>

                    {/* Support/Resistance */}
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        S/R Levels
                      </p>
                      <p className="text-xs text-gray-900 dark:text-gray-100">
                        <span>${signal.key_support.toFixed(2)}</span>
                        <span className="text-gray-500 dark:text-gray-400 mx-1">
                          /
                        </span>
                        <span>${signal.key_resistance.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>

                  {/* Top Signals */}
                  {signal.top_signals.length > 0 && (
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      <p className="mb-1">Signals:</p>
                      <ul className="space-y-1">
                        {signal.top_signals.slice(0, 2).map((sig, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-green-600 dark:text-green-400 mt-0.5">
                              •
                            </span>
                            <span className="text-gray-700 dark:text-gray-300">
                              {sig}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
