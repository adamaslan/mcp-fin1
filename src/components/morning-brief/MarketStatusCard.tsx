"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import type { MorningBriefResult } from "@/lib/mcp/types";

interface MarketStatusCardProps {
  status: MorningBriefResult["market_status"];
}

export function MarketStatusCard({ status }: MarketStatusCardProps) {
  const getStatusColor = (marketStatus: string) => {
    switch (marketStatus) {
      case "OPEN":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "CLOSED":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
      case "PRE_MARKET":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "AFTER_HOURS":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
      default:
        return "";
    }
  };

  const getVixColor = (vix: number) => {
    if (vix < 20) return "text-green-600 dark:text-green-400";
    if (vix < 30) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getFuturesColor = (changePercent: number) => {
    if (changePercent > 0) return "text-green-600 dark:text-green-400";
    if (changePercent < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  return (
    <Card data-testid="market-status-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Market Status</span>
          <Badge className={getStatusColor(status.market_status)}>
            {status.market_status.replace("_", " ")}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Time */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(status.current_time).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZone: "America/New_York",
          })}{" "}
          ET
          {status.market_hours_remaining && (
            <span className="ml-2">
              ({status.market_hours_remaining} remaining)
            </span>
          )}
        </div>

        {/* Futures Data */}
        <div className="grid grid-cols-2 gap-4">
          {/* ES Futures */}
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              ES Futures
            </div>
            <div
              className={`text-lg font-bold mt-1 ${getFuturesColor(status.futures_es.change_percent)}`}
            >
              {status.futures_es.change_percent > 0 ? (
                <TrendingUp className="inline h-4 w-4 mr-1" />
              ) : status.futures_es.change_percent < 0 ? (
                <TrendingDown className="inline h-4 w-4 mr-1" />
              ) : null}
              {status.futures_es.change_percent.toFixed(2)}%
            </div>
          </div>

          {/* NQ Futures */}
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              NQ Futures
            </div>
            <div
              className={`text-lg font-bold mt-1 ${getFuturesColor(status.futures_nq.change_percent)}`}
            >
              {status.futures_nq.change_percent > 0 ? (
                <TrendingUp className="inline h-4 w-4 mr-1" />
              ) : status.futures_nq.change_percent < 0 ? (
                <TrendingDown className="inline h-4 w-4 mr-1" />
              ) : null}
              {status.futures_nq.change_percent.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* VIX */}
        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              VIX Index
            </span>
            <div className={`text-lg font-bold ${getVixColor(status.vix)}`}>
              {status.vix.toFixed(2)}
              {status.vix < 20 && (
                <span className="text-xs ml-2 text-green-600 dark:text-green-400">
                  (Low volatility)
                </span>
              )}
              {status.vix >= 20 && status.vix < 30 && (
                <span className="text-xs ml-2 text-yellow-600 dark:text-yellow-400">
                  (Moderate)
                </span>
              )}
              {status.vix >= 30 && (
                <span className="text-xs ml-2 text-red-600 dark:text-red-400">
                  (High volatility)
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
