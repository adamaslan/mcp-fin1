"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Download, Sparkles } from "lucide-react";
import { AnalysisSummary } from "@/components/fibonacci/AnalysisSummary";
import { ConfluenceZonesCard } from "@/components/fibonacci/ConfluenceZonesCard";
import { SignalsBreakdown } from "@/components/fibonacci/SignalsBreakdown";
import { useLazyMCPQuery } from "@/hooks/useMCPQuery";
import { useTier } from "@/hooks/useTier";
import {
  MCPLoadingState,
  MCPErrorState,
  MCPEmptyState,
  AIInsightsPanel,
} from "@/components/mcp";
import { canAccessAI } from "@/lib/auth/tiers";
import type { FibonacciAnalysisResult } from "@/lib/mcp/types";

function getStrengthColor(strength: string): string {
  switch (strength.toUpperCase()) {
    case "STRONG":
    case "SIGNIFICANT":
      return "bg-green-500 text-white";
    case "MODERATE":
      return "bg-yellow-500 text-white";
    case "WEAK":
      return "bg-gray-500 text-white";
    default:
      return "bg-gray-400 text-white";
  }
}

export default function FibonacciAnalysisPage() {
  const [symbol, setSymbol] = useState("AAPL");
  const [aiEnabled, setAiEnabled] = useState(false);
  const { tier, loading: tierLoading } = useTier();

  // Use lazy query for on-demand fetching
  const {
    data: result,
    loading,
    error,
    execute,
    reset,
  } = useLazyMCPQuery<FibonacciAnalysisResult>();

  // Check AI access
  const canUseAi = !tierLoading && canAccessAI(tier, "analyze_fibonacci");

  const analyzeFibonacci = async () => {
    if (!symbol.trim()) {
      return;
    }

    await execute("/api/mcp/fibonacci", {
      symbol: symbol.toUpperCase(),
      period: "1d",
      window: 50,
      use_ai: aiEnabled && canUseAi,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      analyzeFibonacci();
    }
  };

  const handleReset = () => {
    reset();
    setSymbol("");
  };

  return (
    <div className="container py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Fibonacci Analysis</h1>
        <p className="text-muted-foreground">
          Advanced Fibonacci retracements, extensions, and pattern detection
        </p>
      </div>

      {/* Input Section */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap items-center">
            <Input
              placeholder="Symbol (e.g., AAPL)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              className="max-w-xs"
              disabled={loading}
            />

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

            {!canUseAi && tier === "free" && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                AI available on Pro+
              </span>
            )}

            <Button
              onClick={analyzeFibonacci}
              disabled={loading || !symbol.trim()}
            >
              {loading ? (
                "Analyzing..."
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && <MCPLoadingState tool="analyze_fibonacci" />}

      {/* Error State */}
      {error && !loading && (
        <MCPErrorState error={error} onRetry={analyzeFibonacci} />
      )}

      {/* Results Section */}
      {result && !loading && !error && (
        <>
          {/* Action Bar */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline">
                {result.symbol} • ${result.price.toFixed(2)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Analyzed: {new Date(result.timestamp).toLocaleString()}
              </span>
              {result.ai_analysis && (
                <Badge className="bg-purple-500 text-white">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Enhanced
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                Clear
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* AI Insights Panel */}
          {result.ai_analysis && (
            <div className="mb-6">
              <AIInsightsPanel
                analysis={result.ai_analysis}
                tool="analyze_fibonacci"
              />
            </div>
          )}

          {/* Tabbed Results */}
          <Tabs defaultValue="summary" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="zones">Zones</TabsTrigger>
              <TabsTrigger value="signals">Signals</TabsTrigger>
              <TabsTrigger value="levels">Levels</TabsTrigger>
            </TabsList>

            {/* Tab 1: Summary */}
            <TabsContent value="summary" className="space-y-6">
              <AnalysisSummary result={result} />
            </TabsContent>

            {/* Tab 2: Confluence Zones */}
            <TabsContent value="zones">
              <ConfluenceZonesCard result={result} />
            </TabsContent>

            {/* Tab 3: Signals */}
            <TabsContent value="signals">
              <SignalsBreakdown result={result} />
            </TabsContent>

            {/* Tab 4: Fibonacci Levels */}
            <TabsContent value="levels">
              <Card>
                <CardHeader>
                  <CardTitle>Fibonacci Levels</CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    All Fibonacci retracement and extension levels for{" "}
                    {result.symbol}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[700px] overflow-y-auto">
                    {result.levels.length > 0 ? (
                      result.levels.map((level) => (
                        <div
                          key={level.key}
                          className="flex justify-between items-center p-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-muted/30 transition-all"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono font-semibold text-sm">
                                {level.name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {level.ratio * 100}%
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {(level.distanceFromCurrent * 100).toFixed(1)}%
                              away • {level.type}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-sm font-bold">
                              ${level.price.toFixed(2)}
                            </div>
                            <Badge
                              variant="outline"
                              className={`text-xs ${getStrengthColor(level.strength)}`}
                            >
                              {level.strength}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground text-center py-12">
                        No levels calculated
                      </div>
                    )}
                  </div>

                  {result.tierLimit && (
                    <div className="mt-4 p-3 bg-muted/50 rounded text-xs text-muted-foreground">
                      <p>
                        Showing {result.tierLimit.levelsAvailable} levels.
                        {typeof result.tierLimit.signalsTotal === "number" &&
                          result.tierLimit.signalsShown <
                            result.tierLimit.signalsTotal && (
                            <>
                              {" "}
                              <a
                                href="/pricing"
                                className="text-primary hover:underline"
                              >
                                Upgrade for more
                              </a>
                            </>
                          )}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Empty State */}
      {!result && !loading && !error && (
        <MCPEmptyState
          tool="analyze_fibonacci"
          onAction={() => document.querySelector("input")?.focus()}
        />
      )}
    </div>
  );
}
