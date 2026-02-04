"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";
import { useLazyMCPQuery } from "@/hooks/useMCPQuery";
import { useTier } from "@/hooks/useTier";
import {
  MCPLoadingState,
  MCPErrorState,
  MCPEmptyState,
  AIInsightsPanel,
} from "@/components/mcp";
import { canAccessAI, isToolEnabled } from "@/lib/auth/tiers";
import type { OptionsRiskResult } from "@/lib/mcp/types";

const POSITION_TYPES = [
  { value: "call", label: "Call Option" },
  { value: "put", label: "Put Option" },
  { value: "spread", label: "Spread" },
];

export default function OptionsPage() {
  const [symbol, setSymbol] = useState("SPY");
  const [positionType, setPositionType] = useState<"call" | "put" | "spread">(
    "call",
  );
  const [aiEnabled, setAiEnabled] = useState(false);
  const { tier, loading: tierLoading } = useTier();

  // Use lazy query for on-demand fetching
  const {
    data: result,
    loading,
    error,
    execute,
    reset,
  } = useLazyMCPQuery<OptionsRiskResult>();

  // Check tool and AI access
  const toolEnabled =
    !tierLoading && isToolEnabled(tier, "options_risk_analysis");
  const canUseAi = !tierLoading && canAccessAI(tier, "options_risk_analysis");

  const analyzeOptions = async () => {
    if (!symbol.trim()) {
      return;
    }

    await execute("/api/mcp/options-risk", {
      symbol: symbol.toUpperCase(),
      position_type: positionType,
      use_ai: aiEnabled && canUseAi,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      analyzeOptions();
    }
  };

  const handleReset = () => {
    reset();
    setSymbol("SPY");
  };

  // Show upgrade message if tool not enabled
  if (!tierLoading && !toolEnabled) {
    return (
      <div className="container py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Options Risk Analysis</h1>
          <p className="text-muted-foreground">
            Analyze options risk with Greeks, scenarios, and strategy
            recommendations
          </p>
        </div>

        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
          <CardContent className="py-12 text-center">
            <LineChart className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            <h3 className="text-xl font-semibold mb-2">Pro Feature</h3>
            <p className="text-muted-foreground mb-4">
              Options risk analysis is available on Pro and Max tiers.
            </p>
            <Button asChild>
              <a href="/pricing">View Plans</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Options Risk Analysis</h1>
        <p className="text-muted-foreground">
          Analyze options risk with Greeks, scenarios, and strategy
          recommendations
        </p>
      </div>

      {/* Input Section */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap items-center">
            <Input
              placeholder="Symbol (e.g., SPY)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              className="w-32"
              disabled={loading}
            />

            <Select
              value={positionType}
              onValueChange={(v) => setPositionType(v as typeof positionType)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Position type" />
              </SelectTrigger>
              <SelectContent>
                {POSITION_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* AI Toggle */}
            {canUseAi && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiEnabled}
                  onChange={(e) => setAiEnabled(e.target.checked)}
                  className="rounded border-gray-300"
                  disabled={loading}
                />
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span className="text-sm">AI Analysis</span>
              </label>
            )}

            <Button
              onClick={analyzeOptions}
              disabled={loading || !symbol.trim()}
            >
              {loading ? (
                "Analyzing..."
              ) : (
                <>
                  <LineChart className="mr-2 h-4 w-4" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && <MCPLoadingState tool="options_risk_analysis" />}

      {/* Error State */}
      {error && !loading && (
        <MCPErrorState error={error} onRetry={analyzeOptions} />
      )}

      {/* Results Section */}
      {result && !loading && !error && (
        <>
          {/* Action Bar */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline">
                {result.symbol} • ${result.underlying_price.toFixed(2)}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {result.position.type}
              </Badge>
              {result.ai_analysis && (
                <Badge className="bg-purple-500 text-white">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Enhanced
                </Badge>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleReset}>
              Clear
            </Button>
          </div>

          {/* AI Insights Panel */}
          {result.ai_analysis && (
            <div className="mb-6">
              <AIInsightsPanel
                analysis={result.ai_analysis}
                tool="options_risk_analysis"
              />
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Position Details */}
            <Card>
              <CardHeader>
                <CardTitle>Position Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Strike</p>
                    <p className="text-xl font-bold">
                      ${result.position.strike.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Premium</p>
                    <p className="text-xl font-bold">
                      ${result.position.premium.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Implied Vol</p>
                    <p className="text-xl font-bold">
                      {result.position.implied_volatility.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Days to Expiry
                    </p>
                    <p className="text-xl font-bold">
                      {result.position.days_to_expiry}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Greeks */}
            <Card>
              <CardHeader>
                <CardTitle>Greeks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Delta</p>
                    <p className="text-lg font-bold">
                      {result.greeks.delta.toFixed(3)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Gamma</p>
                    <p className="text-lg font-bold">
                      {result.greeks.gamma.toFixed(4)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Theta</p>
                    <p className="text-lg font-bold text-red-600">
                      {result.greeks.theta.toFixed(3)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Vega</p>
                    <p className="text-lg font-bold">
                      {result.greeks.vega.toFixed(3)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rho</p>
                    <p className="text-lg font-bold">
                      {result.greeks.rho.toFixed(3)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Max Profit</p>
                    <p className="text-xl font-bold text-green-600">
                      ${result.risk_metrics.max_profit.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Max Loss</p>
                    <p className="text-xl font-bold text-red-600">
                      -${Math.abs(result.risk_metrics.max_loss).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Breakeven</p>
                    <p className="text-xl font-bold">
                      ${result.risk_metrics.breakeven.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Win Probability
                    </p>
                    <p className="text-xl font-bold">
                      {(
                        result.risk_metrics.probability_of_profit * 100
                      ).toFixed(0)}
                      %
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Risk/Reward Ratio</span>
                    <Badge
                      className={
                        result.risk_metrics.risk_reward_ratio >= 2
                          ? "bg-green-500"
                          : result.risk_metrics.risk_reward_ratio >= 1
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }
                    >
                      1:{result.risk_metrics.risk_reward_ratio.toFixed(2)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price Scenarios */}
            <Card>
              <CardHeader>
                <CardTitle>Price Scenarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.scenarios.map((scenario, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium text-sm">{scenario.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {scenario.price_change_percent >= 0 ? "+" : ""}
                          {scenario.price_change_percent.toFixed(1)}% → $
                          {scenario.new_price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold ${
                            scenario.pnl >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {scenario.pnl >= 0 ? "+" : ""}$
                          {scenario.pnl.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Delta: {scenario.new_delta.toFixed(3)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Warning */}
          <Card className="mt-6 border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/20">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-700 dark:text-yellow-400">
                    Risk Disclosure
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Options trading involves significant risk and is not
                    suitable for all investors. This analysis is for
                    informational purposes only and should not be considered
                    financial advice.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {!result && !loading && !error && (
        <MCPEmptyState
          tool="options_risk_analysis"
          onAction={() => document.querySelector("input")?.focus()}
        />
      )}
    </div>
  );
}
