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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Briefcase, Plus, X } from "lucide-react";

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
        setError(data.error || data.message || "Portfolio assessment failed");
      } else {
        setResult(data);
      }
    } catch {
      setError("Failed to connect to analysis server");
    } finally {
      setLoading(false);
    }
  }

  const riskMetrics = result?.risk_metrics as
    | Record<string, unknown>
    | undefined;
  const sectorExposure = result?.sector_exposure as
    | Record<string, number>
    | undefined;
  const hedgeSuggestions = (result?.hedge_suggestions as string[]) || [];

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
      {result && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Risk Metrics */}
          {riskMetrics && (
            <Card>
              <CardHeader>
                <CardTitle>Risk Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(riskMetrics).map(([key, val]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground capitalize">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="font-medium">
                      {typeof val === "number" ? val.toFixed(3) : String(val)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Sector Exposure */}
          {sectorExposure && Object.keys(sectorExposure).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Sector Exposure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(sectorExposure)
                  .sort(([, a], [, b]) => b - a)
                  .map(([sector, pct]) => (
                    <div key={sector} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{sector}</span>
                        <span className="font-medium">
                          {(pct * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className="bg-primary rounded-full h-1.5"
                          style={{ width: `${Math.min(pct * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}

          {/* Hedge Suggestions */}
          {hedgeSuggestions.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Hedge Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {hedgeSuggestions.map((suggestion, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Badge variant="outline" className="mt-0.5 shrink-0">
                        {i + 1}
                      </Badge>
                      <span>{suggestion}</span>
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
