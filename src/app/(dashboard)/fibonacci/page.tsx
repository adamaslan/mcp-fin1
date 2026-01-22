"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, TrendingUp, Download } from "lucide-react";
import { AnalysisSummary } from "@/components/fibonacci/AnalysisSummary";
import { ConfluenceZonesCard } from "@/components/fibonacci/ConfluenceZonesCard";
import { SignalsBreakdown } from "@/components/fibonacci/SignalsBreakdown";
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
  const [result, setResult] = useState<FibonacciAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeFibonacci = async () => {
    if (!symbol.trim()) {
      setError("Please enter a symbol");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/mcp/fibonacci", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: symbol.toUpperCase(),
          period: "1d",
          window: 50,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      analyzeFibonacci();
    }
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
          <div className="flex gap-4">
            <Input
              placeholder="Symbol (e.g., AAPL)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              className="max-w-xs"
              disabled={loading}
            />
            <Button onClick={analyzeFibonacci} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Analyze
                </>
              )}
            </Button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
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
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>

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

      {!result && !loading && (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>
              Enter a symbol and click Analyze to see Fibonacci levels and
              signals
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
