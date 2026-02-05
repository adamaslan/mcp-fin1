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
import { Checkbox } from "@/components/ui/checkbox";
import { RiskDashboard } from "@/components/portfolio/RiskDashboard";
import { DividendTracker } from "@/components/portfolio/DividendTracker";
import { CorrelationMatrix } from "@/components/portfolio/CorrelationMatrix";
import { useTier } from "@/hooks/useTier";
import { useMCPQuery } from "@/hooks/useMCPQuery";
import { AIInsightsPanel } from "@/components/mcp/AIInsightsPanel";
import type { PortfolioRiskResult } from "@/lib/mcp/types";
import { Loader2, AlertCircle, Plus, Trash2, Sparkles } from "lucide-react";

interface Position {
  symbol: string;
  shares: number;
  entry_price: number;
}

export default function PortfolioPage() {
  const { tier } = useTier();
  const [positions, setPositions] = useState<Position[]>([
    { symbol: "AAPL", shares: 100, entry_price: 150 },
    { symbol: "MSFT", shares: 50, entry_price: 300 },
    { symbol: "GOOGL", shares: 25, entry_price: 140 },
  ]);

  const [newSymbol, setNewSymbol] = useState("");
  const [newShares, setNewShares] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [useAI, setUseAI] = useState(false);

  const {
    data: riskData,
    loading,
    error: queryError,
  } = useMCPQuery<PortfolioRiskResult>({
    endpoint: "/api/mcp/portfolio-risk",
    params: {
      positions,
      use_ai: useAI,
    },
    enabled: positions.length > 0,
    refetchOnParamsChange: true,
  });

  const error = queryError as string | null;

  const handleAddPosition = () => {
    if (!newSymbol.trim() || !newShares || !newPrice) {
      setFormError("Please fill in all fields");
      return;
    }

    const newPosition = {
      symbol: newSymbol.toUpperCase(),
      shares: parseFloat(newShares),
      entry_price: parseFloat(newPrice),
    };

    setPositions([...positions, newPosition]);
    setNewSymbol("");
    setNewShares("");
    setNewPrice("");
    setFormError(null);
  };

  const handleRemovePosition = (symbol: string) => {
    setPositions(positions.filter((p) => p.symbol !== symbol));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Portfolio Risk Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your aggregate portfolio risk, sector concentration, and
          position-level metrics.
        </p>
      </div>

      {/* Add position form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Position</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            <Input
              placeholder="Symbol"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
              className="w-24"
            />
            <Input
              type="number"
              placeholder="Shares"
              value={newShares}
              onChange={(e) => setNewShares(e.target.value)}
              className="w-24"
            />
            <Input
              type="number"
              placeholder="Entry Price"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="w-32"
            />
            <Button onClick={handleAddPosition} disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          {formError && <p className="text-xs text-red-500">{formError}</p>}
        </CardContent>
      </Card>

      {/* Current positions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Open Positions ({positions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {positions.map((position) => (
              <div
                key={position.symbol}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div>
                  <p className="font-semibold">{position.symbol}</p>
                  <p className="text-xs text-muted-foreground">
                    {position.shares} shares @ \$
                    {position.entry_price.toFixed(2)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemovePosition(position.symbol)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
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

      {/* Risk assessment */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {riskData && !loading && (
        <>
          {/* AI Analysis */}
          {riskData.ai_analysis && (
            <AIInsightsPanel
              analysis={riskData.ai_analysis}
              tool="portfolio_risk"
              title="Portfolio AI Analysis"
            />
          )}

          <RiskDashboard riskData={riskData} />
        </>
      )}

      {positions.length === 0 && !loading && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>Add positions to see risk assessment</p>
          </CardContent>
        </Card>
      )}

      {/* Correlation Matrix */}
      {positions.length >= 2 && <CorrelationMatrix />}

      {/* Dividend Tracker */}
      <DividendTracker />
    </div>
  );
}
