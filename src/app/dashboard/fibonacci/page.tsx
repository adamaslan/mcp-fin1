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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Target } from "lucide-react";

const PERIODS = [
  { value: "1mo", label: "1 Month" },
  { value: "3mo", label: "3 Months" },
  { value: "6mo", label: "6 Months" },
  { value: "1y", label: "1 Year" },
];

export default function FibonacciPage() {
  const [symbol, setSymbol] = useState("AAPL");
  const [period, setPeriod] = useState("3mo");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAnalysis() {
    if (!symbol.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/mcp/fibonacci", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: symbol.trim().toUpperCase(), period }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.message || "Fibonacci analysis failed");
      } else {
        setResult(data);
      }
    } catch {
      setError("Failed to connect to analysis server");
    } finally {
      setLoading(false);
    }
  }

  const levels =
    (result?.levels as Array<{
      name: string;
      price: number;
      active?: boolean;
    }>) || [];
  const signals =
    (result?.signals as Array<{
      name: string;
      type: string;
      description?: string;
    }>) || [];
  const confluenceZones =
    (result?.confluence_zones as Array<{
      price_range: [number, number];
      strength: string;
    }>) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Fibonacci Analysis</h1>
        <p className="text-muted-foreground">
          40+ Fibonacci levels, confluence zones, and Elliott Wave patterns
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3 flex-wrap">
            <Input
              placeholder="Ticker symbol (e.g. AAPL)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && runAnalysis()}
              className="max-w-xs"
            />
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIODS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={runAnalysis} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Target className="h-4 w-4 mr-2" />
              )}
              Analyze Fibonacci
            </Button>
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
            <span>Running Fibonacci analysis for {symbol}...</span>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Key Levels */}
          {levels.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Fibonacci Levels</CardTitle>
                <CardDescription>Key price levels for {symbol}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {levels.slice(0, 15).map((level, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded bg-muted/50"
                    >
                      <span className="text-sm font-medium">{level.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono">
                          $
                          {typeof level.price === "number"
                            ? level.price.toFixed(2)
                            : level.price}
                        </span>
                        {level.active && (
                          <Badge variant="default" className="text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Signals */}
          {signals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Fibonacci Signals</CardTitle>
                <CardDescription>
                  {signals.length} signals detected
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {signals.slice(0, 10).map((signal, i) => (
                    <div key={i} className="p-2 rounded bg-muted/50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {signal.name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {signal.type}
                        </Badge>
                      </div>
                      {signal.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {signal.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Confluence Zones */}
          {confluenceZones.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Confluence Zones</CardTitle>
                <CardDescription>
                  Areas with multiple overlapping Fibonacci levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {confluenceZones.map((zone, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/50">
                      <Badge variant="secondary" className="mb-2">
                        {zone.strength}
                      </Badge>
                      <p className="text-sm font-mono">
                        ${zone.price_range[0].toFixed(2)} – $
                        {zone.price_range[1].toFixed(2)}
                      </p>
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
