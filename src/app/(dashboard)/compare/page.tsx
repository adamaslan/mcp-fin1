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
  BarChart3,
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useLazyMCPQuery } from "@/hooks/useMCPQuery";
import { useTier } from "@/hooks/useTier";
import {
  MCPLoadingState,
  MCPErrorState,
  MCPEmptyState,
  AIInsightsPanel,
} from "@/components/mcp";
import { canAccessAI, isToolEnabled, getToolLimits } from "@/lib/auth/tiers";
import type { ComparisonResult } from "@/lib/mcp/types";

const METRICS = [
  { value: "signals", label: "Technical Signals" },
  { value: "momentum", label: "Momentum" },
  { value: "volatility", label: "Volatility" },
  { value: "trend", label: "Trend Strength" },
];

export default function ComparePage() {
  const [symbols, setSymbols] = useState<string[]>(["AAPL", "MSFT"]);
  const [newSymbol, setNewSymbol] = useState("");
  const [metric, setMetric] = useState("signals");
  const [aiEnabled, setAiEnabled] = useState(false);
  const { tier, loading: tierLoading } = useTier();

  // Use lazy query for on-demand fetching
  const {
    data: result,
    loading,
    error,
    execute,
    reset,
  } = useLazyMCPQuery<ComparisonResult>();

  // Check tool and AI access
  const toolEnabled = !tierLoading && isToolEnabled(tier, "compare_securities");
  const canUseAi = !tierLoading && canAccessAI(tier, "compare_securities");
  const toolLimits = !tierLoading
    ? getToolLimits(tier, "compare_securities")
    : null;
  const maxSymbols = (toolLimits?.maxSymbols as number) || 5;

  const addSymbol = () => {
    const sym = newSymbol.trim().toUpperCase();
    if (sym && !symbols.includes(sym) && symbols.length < maxSymbols) {
      setSymbols([...symbols, sym]);
      setNewSymbol("");
    }
  };

  const removeSymbol = (sym: string) => {
    setSymbols(symbols.filter((s) => s !== sym));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addSymbol();
    }
  };

  const runComparison = async () => {
    if (symbols.length < 2) {
      return;
    }

    await execute("/api/mcp/compare", {
      symbols,
      metric,
      use_ai: aiEnabled && canUseAi,
    });
  };

  const handleReset = () => {
    reset();
    setSymbols(["AAPL", "MSFT"]);
  };

  // Show upgrade message if tool not enabled
  if (!tierLoading && !toolEnabled) {
    return (
      <div className="container py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Compare Securities</h1>
          <p className="text-muted-foreground">
            Compare multiple stocks side-by-side across key metrics
          </p>
        </div>

        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            <h3 className="text-xl font-semibold mb-2">Pro Feature</h3>
            <p className="text-muted-foreground mb-4">
              Security comparison is available on Pro and Max tiers.
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
        <h1 className="text-3xl font-bold mb-2">Compare Securities</h1>
        <p className="text-muted-foreground">
          Compare multiple stocks side-by-side across key metrics
        </p>
      </div>

      {/* Symbol Selection */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Select Securities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current symbols */}
          <div className="flex flex-wrap gap-2">
            {symbols.map((sym) => (
              <Badge
                key={sym}
                variant="secondary"
                className="text-sm py-1 px-3 flex items-center gap-1"
              >
                {sym}
                <button
                  onClick={() => removeSymbol(sym)}
                  className="ml-1 hover:text-red-500"
                  disabled={symbols.length <= 2}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>

          {/* Add symbol input */}
          <div className="flex gap-4 flex-wrap items-center">
            <div className="flex gap-2">
              <Input
                placeholder="Add symbol (e.g., GOOGL)"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                className="w-48"
                disabled={loading || symbols.length >= maxSymbols}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={addSymbol}
                disabled={
                  loading || !newSymbol.trim() || symbols.length >= maxSymbols
                }
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Select value={metric} onValueChange={setMetric}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Comparison metric" />
              </SelectTrigger>
              <SelectContent>
                {METRICS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
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
              onClick={runComparison}
              disabled={loading || symbols.length < 2}
            >
              {loading ? (
                "Comparing..."
              ) : (
                <>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Compare
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            {symbols.length} of {maxSymbols} symbols selected (minimum 2
            required)
          </p>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && <MCPLoadingState tool="compare_securities" />}

      {/* Error State */}
      {error && !loading && (
        <MCPErrorState error={error} onRetry={runComparison} />
      )}

      {/* Results Section */}
      {result && !loading && !error && (
        <>
          {/* Action Bar */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline">
                {result.symbols.length} securities compared
              </Badge>
              <span className="text-xs text-muted-foreground">
                Metric: {METRICS.find((m) => m.value === result.metric)?.label}
              </span>
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
                tool="compare_securities"
              />
            </div>
          )}

          {/* Winner Banner */}
          {result.winner && (
            <Card className="mb-6 border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <Trophy className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-700 dark:text-green-400">
                      Top Pick: {result.winner}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Based on {result.metric} analysis
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Comparison Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 font-semibold">Symbol</th>
                      <th className="text-right py-3 font-semibold">Price</th>
                      <th className="text-right py-3 font-semibold">Change</th>
                      <th className="text-center py-3 font-semibold">
                        Signals
                      </th>
                      <th className="text-center py-3 font-semibold">
                        Bull/Bear
                      </th>
                      <th className="text-left py-3 font-semibold">Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.comparisons.map((comp, idx) => (
                      <tr
                        key={comp.symbol}
                        className={`border-b last:border-b-0 hover:bg-muted/50 ${
                          comp.recommended
                            ? "bg-green-50/50 dark:bg-green-950/10"
                            : ""
                        }`}
                      >
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{comp.symbol}</span>
                            {comp.recommended && (
                              <Badge className="bg-green-500 text-xs">
                                Best
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="text-right">${comp.price.toFixed(2)}</td>
                        <td className="text-right">
                          <span
                            className={
                              comp.change_percent >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {comp.change_percent >= 0 ? "+" : ""}
                            {comp.change_percent.toFixed(2)}%
                          </span>
                        </td>
                        <td className="text-center">{comp.signal_count}</td>
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-green-600 flex items-center">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {comp.bullish_signals}
                            </span>
                            <span className="text-red-600 flex items-center">
                              <TrendingDown className="h-3 w-3 mr-1" />
                              {comp.bearish_signals}
                            </span>
                          </div>
                        </td>
                        <td className="text-left">
                          <Badge variant="outline">#{idx + 1}</Badge>
                          {comp.ranking_reason && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {comp.ranking_reason}
                            </p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {!result && !loading && !error && (
        <MCPEmptyState
          tool="compare_securities"
          onAction={() => document.querySelector("input")?.focus()}
        />
      )}
    </div>
  );
}
