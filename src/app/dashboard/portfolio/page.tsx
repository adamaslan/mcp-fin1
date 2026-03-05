"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Briefcase, Plus, X, AlertCircle } from "lucide-react";
import { SectorBreakdown } from "@/components/portfolio/SectorBreakdown";
import { RiskDistribution } from "@/components/portfolio/RiskDistribution";
import { PortfolioRiskResult, SectorSummary } from "@/lib/mcp/types";

interface Position {
  symbol: string;
  shares: number;
  entry_price: number;
}

export default function PortfolioPage() {
  const [positions, setPositions] = useState<Position[]>([
    { symbol: "AAPL", shares: 10, entry_price: 175 },
    { symbol: "MSFT", shares: 5, entry_price: 380 },
  ]);
  const [newSymbol, setNewSymbol] = useState("");
  const [newShares, setNewShares] = useState("");
  const [newEntryPrice, setNewEntryPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Preload Firebase cached data on mount
  useEffect(() => {
    const preloadFirebaseData = async () => {
      try {
        const res = await fetch("/api/public/portfolio-demo");
        const json = await res.json();

        if (res.ok && json.data?.positions) {
          // Pre-populate the result state with Firebase data
          setResult(json.data);
          // Show a banner that this is cached data
          console.log("Loaded cached portfolio data from Firebase");
        }
      } catch (err) {
        // Silently fail — this is optional preload
        console.debug("Could not preload Firebase data:", err);
      }
    };

    preloadFirebaseData();
  }, []);

  function addPosition() {
    const sym = newSymbol.trim().toUpperCase();
    const shares = parseFloat(newShares);
    const price = parseFloat(newEntryPrice);
    if (!sym || isNaN(shares) || isNaN(price) || shares <= 0 || price <= 0)
      return;
    setPositions([...positions, { symbol: sym, shares, entry_price: price }]);
    setNewSymbol("");
    setNewShares("");
    setNewEntryPrice("");
  }

  function removePosition(index: number) {
    setPositions(positions.filter((_, i) => i !== index));
  }

  async function runRiskAssessment() {
    if (positions.length === 0) {
      setError("Add at least one position");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/mcp/portfolio-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positions }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errorMsg =
          data.error || data.message || "Portfolio assessment failed";
        setError(errorMsg);

        // Fallback to Firebase cache if MCP server is unavailable
        if (
          res.status === 503 ||
          errorMsg.includes("Analysis server") ||
          errorMsg.includes("MCP")
        ) {
          try {
            const cacheRes = await fetch("/api/public/portfolio-demo");
            const cacheJson = await cacheRes.json();

            if (cacheRes.ok && cacheJson.data) {
              setResult(cacheJson.data);
              setError(
                "Using cached portfolio data from Firebase (live analysis unavailable)",
              );
              return;
            }
          } catch {
            // Also failed — show original error
          }
        }
      } else {
        setResult(data);
      }
    } catch {
      setError("Failed to connect to analysis server");
    } finally {
      setLoading(false);
    }
  }

  const riskResult = result as unknown as PortfolioRiskResult | undefined;
  const sectors = riskResult?.sectors as
    | Record<string, SectorSummary>
    | undefined;
  const allPositions = riskResult?.all_positions || riskResult?.positions || [];
  const sectorConcentration = riskResult?.sector_concentration || {};
  const hedgeSuggestions = riskResult?.hedge_suggestions || [];
  const overallRiskLevel = riskResult?.overall_risk_level || "LOW";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Portfolio Risk</h1>
        <p className="text-muted-foreground">
          Assess aggregate risk, sector exposure, and hedging suggestions
        </p>
      </div>

      {/* Positions */}
      <Card>
        <CardHeader>
          <CardTitle>Positions</CardTitle>
          <CardDescription>Add your current positions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {positions.length > 0 && (
            <div className="space-y-2">
              {positions.map((pos, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-bold w-16">{pos.symbol}</span>
                    <span>{pos.shares} shares</span>
                    <span>@ ${pos.entry_price.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => removePosition(i)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add position form */}
          <div className="flex gap-2 flex-wrap">
            <Input
              placeholder="Symbol"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
              className="w-24"
            />
            <Input
              placeholder="Shares"
              type="number"
              value={newShares}
              onChange={(e) => setNewShares(e.target.value)}
              className="w-24"
            />
            <Input
              placeholder="Entry $"
              type="number"
              value={newEntryPrice}
              onChange={(e) => setNewEntryPrice(e.target.value)}
              className="w-28"
            />
            <Button variant="outline" onClick={addPosition}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              onClick={runRiskAssessment}
              disabled={loading || positions.length === 0}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Briefcase className="h-4 w-4 mr-2" />
              )}
              Assess Portfolio Risk
            </Button>

            {positions.length === 0 && (
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const res = await fetch("/api/public/portfolio-demo");
                    const json = await res.json();
                    if (json.data?.positions) {
                      setPositions(json.data.positions.slice(0, 12)); // Load top 12
                      setResult(json.data);
                    }
                  } catch (err) {
                    console.error("Failed to load cached positions:", err);
                  }
                }}
                className="w-full sm:w-auto"
              >
                Load Cached Portfolio
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span>Assessing portfolio risk...</span>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && !loading && riskResult && (
        <div className="space-y-6">
          {/* INFO: Show if data source is from Firebase cache */}
          {(result?.source === "firestore_cache" ||
            result?.source === "firestore_demo") && (
            <Card className="bg-blue-500/10 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-4">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  📦 Showing cached portfolio data from Firebase
                  {result?.source === "firestore_demo"
                    ? " (demo)"
                    : " (recent analysis)"}
                  — click "Assess Portfolio Risk" with live data to refresh.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Portfolio Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  $
                  {riskResult.total_value.toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {allPositions.length} positions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Max Loss</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-500">
                  $
                  {riskResult.total_max_loss.toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {riskResult.risk_percent_of_portfolio.toFixed(1)}% of
                  portfolio
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Risk Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge
                  className={
                    overallRiskLevel === "LOW"
                      ? "bg-green-500/10 text-green-700 dark:text-green-400 text-base"
                      : overallRiskLevel === "MEDIUM"
                        ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-base"
                        : overallRiskLevel === "HIGH"
                          ? "bg-orange-500/10 text-orange-700 dark:text-orange-400 text-base"
                          : "bg-red-500/10 text-red-700 dark:text-red-400 text-base"
                  }
                >
                  {overallRiskLevel}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Risk Concentration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {riskResult.risk_percent_of_portfolio.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  of total capital at risk
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Risk Alert */}
          {(overallRiskLevel === "HIGH" || overallRiskLevel === "CRITICAL") && (
            <Card className="bg-red-500/10 border-red-200 dark:border-red-800">
              <CardContent className="pt-6 flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-700 dark:text-red-400">
                    High Portfolio Risk
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                    Your portfolio risk exceeds recommended levels. Consider
                    reducing position sizes or hedging high-risk sectors.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Risk Distribution */}
          <RiskDistribution
            positions={allPositions}
            totalValue={riskResult.total_value}
            totalMaxLoss={riskResult.total_max_loss}
          />

          {/* Sector Breakdown */}
          {sectors && Object.keys(sectors).length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">11-Sector Breakdown</h2>
              <SectorBreakdown
                sectors={sectors}
                sectorConcentration={sectorConcentration}
                totalPortfolioValue={riskResult.total_value}
              />
            </div>
          )}

          {/* Hedge Suggestions */}
          {hedgeSuggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Hedge Suggestions</CardTitle>
                <CardDescription>
                  Recommended hedges to manage sector concentration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {hedgeSuggestions.map((suggestion, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 text-sm p-3 bg-muted/50 rounded-lg"
                    >
                      <Badge variant="secondary" className="mt-0.5 shrink-0">
                        {i + 1}
                      </Badge>
                      <span className="text-foreground">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
