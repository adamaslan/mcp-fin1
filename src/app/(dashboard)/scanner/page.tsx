"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useTier } from "@/hooks/useTier";
import { canAccessUniverse, TIER_LIMITS } from "@/lib/auth/tiers";
import { useLazyMCPQuery } from "@/hooks/useMCPQuery";
import { AIInsightsPanel } from "@/components/mcp/AIInsightsPanel";
import type { ScanResult } from "@/lib/mcp/types";
import { Loader2, AlertCircle, TrendingUp, TrendingDown, Sparkles } from "lucide-react";

export default function ScannerPage() {
  const { tier } = useTier();
  const [selectedUniverse, setSelectedUniverse] = useState("sp500");
  const [useAI, setUseAI] = useState(false);
  const { data, loading, error, execute } = useLazyMCPQuery();

  const tierLimits = TIER_LIMITS[tier];

  const universes = [
    { value: "sp500", label: "S&P 500", available: true },
    {
      value: "nasdaq100",
      label: "NASDAQ 100",
      available: canAccessUniverse(tier, "nasdaq100"),
    },
    {
      value: "etf_large_cap",
      label: "ETF Large Cap",
      available: canAccessUniverse(tier, "etf_large_cap"),
    },
    {
      value: "crypto",
      label: "Crypto",
      available: canAccessUniverse(tier, "crypto"),
    },
  ];

  const handleScan = async () => {
    if (!canAccessUniverse(tier, selectedUniverse)) {
      return;
    }

    await execute("/api/mcp/scan", {
      universe: selectedUniverse,
      maxResults: tierLimits.scanResultsLimit,
      use_ai: useAI,
    });
  };

  const trades = data?.qualified_trades || [];
  const resultsLimited = data?.resultsLimited || false;

  const getRiskQualityColor = (quality) => {
    switch (quality) {
      case "high":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "medium":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "low":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Scan controls */}
      <Card>
        <CardHeader>
          <CardTitle>Trade Scanner</CardTitle>
          <CardDescription>
            Automatically find qualified trade setups. Free: 1/day (5 results),
            Pro: 10/day (25 results), Max: Unlimited
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Universe</label>
              <Select
                value={selectedUniverse}
                onValueChange={setSelectedUniverse}
              >
                <SelectTrigger disabled={loading}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {universes.map((u) => (
                    <SelectItem
                      key={u.value}
                      value={u.value}
                      disabled={!u.available}
                    >
                      {u.label} {!u.available && "(Locked)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleScan} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Scan Now
            </Button>
          </div>

          {/* AI Toggle */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <Checkbox
              id="ai-toggle"
              checked={useAI}
              onCheckedChange={(checked) => setUseAI(checked)}
              disabled={loading || tier === "free"}
            />
            <label
              htmlFor="ai-toggle"
              className="text-sm cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4 text-purple-500" />
              AI Insights {tier === "free" && "(Pro+)"}
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="bg-red-500/10 border-red-200 dark:border-red-800">
          <CardContent className="pt-6 flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Results */}
      {!loading && trades.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Scan Results</h2>
            <p className="text-sm text-muted-foreground">
              {trades.length} qualified trade{trades.length !== 1 ? "s" : ""}{" "}
              found
              {resultsLimited && " (limited by your tier)"}
            </p>
          </div>

          {/* AI Analysis */}
          {data?.ai_analysis && (
            <AIInsightsPanel
              analysis={data.ai_analysis}
              tool="scan_securities"
              title="Scan AI Analysis"
            />
          )}

          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 font-semibold">Symbol</th>
                      <th className="text-right py-3 font-semibold">Entry</th>
                      <th className="text-right py-3 font-semibold">Stop</th>
                      <th className="text-right py-3 font-semibold">Target</th>
                      <th className="text-right py-3 font-semibold">R:R</th>
                      <th className="text-center py-3 font-semibold">Bias</th>
                      <th className="text-center py-3 font-semibold">Quality</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((trade, idx) => (
                      <tr
                        key={idx}
                        className="border-b last:border-b-0 hover:bg-muted/50"
                      >
                        <td className="py-3 font-semibold">{trade.symbol}</td>
                        <td className="text-right">
                          \${trade.entry_price.toFixed(2)}
                        </td>
                        <td className="text-right text-red-500">
                          \${trade.stop_price.toFixed(2)}
                        </td>
                        <td className="text-right text-green-500">
                          \${trade.target_price.toFixed(2)}
                        </td>
                        <td className="text-right">
                          {trade.risk_reward_ratio.toFixed(2)}:1
                        </td>
                        <td className="text-center">
                          {trade.bias === "bullish" ? (
                            <TrendingUp className="h-4 w-4 text-green-500 mx-auto" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500 mx-auto" />
                          )}
                        </td>
                        <td className="text-center">
                          <Badge className={getRiskQualityColor(trade.risk_quality)}>
                            {trade.risk_quality.toUpperCase()}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {resultsLimited && (
            <Card className="bg-blue-500/10 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6 text-sm text-blue-700 dark:text-blue-400">
                <p>
                  Your tier limits results to {tierLimits.scanResultsLimit}.
                  Upgrade to see more.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!loading && trades.length === 0 && !error && data && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>No qualified trades found in {selectedUniverse}. Try a different universe.</p>
          </CardContent>
        </Card>
      )}

      {!loading && !data && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>Select a universe and click Scan to find trade opportunities</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
