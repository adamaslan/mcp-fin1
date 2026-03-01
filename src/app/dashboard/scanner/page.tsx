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
import { Loader2, Search, TrendingUp, TrendingDown } from "lucide-react";

const UNIVERSES = [
  { value: "sp500", label: "S&P 500" },
  { value: "nasdaq100", label: "Nasdaq 100" },
  { value: "etf_large_cap", label: "Large Cap ETFs" },
  { value: "tech", label: "Tech Stocks" },
];

const PERIODS = [
  { value: "1mo", label: "1 Month" },
  { value: "3mo", label: "3 Months" },
  { value: "6mo", label: "6 Months" },
];

export default function ScannerPage() {
  const [universe, setUniverse] = useState("sp500");
  const [period, setPeriod] = useState("3mo");
  const [maxResults, setMaxResults] = useState("10");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Array<Record<string, unknown>> | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  async function runScan() {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch("/api/mcp/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          universe,
          period,
          max_results: parseInt(maxResults),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.message || "Scan failed");
      } else {
        const trades = data.trades || data.results || data.data || [];
        setResults(Array.isArray(trades) ? trades : []);
      }
    } catch {
      setError("Failed to connect to scan server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Trade Scanner</h1>
        <p className="text-muted-foreground">
          Find qualified trade setups across major stock universes
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Scan Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1">
              <label className="text-sm font-medium">Universe</label>
              <Select value={universe} onValueChange={setUniverse}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIVERSES.map((u) => (
                    <SelectItem key={u.value} value={u.value}>
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Period</label>
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
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Max Results</label>
              <Select value={maxResults} onValueChange={setMaxResults}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["5", "10", "20"].map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={runScan} disabled={loading} className="mt-auto">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Run Scan
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
            <span>Scanning {universe}...</span>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results && !loading && (
        <Card>
          <CardHeader>
            <CardTitle>Scan Results</CardTitle>
            <CardDescription>
              {results.length} trade setup{results.length !== 1 ? "s" : ""}{" "}
              found in {universe}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No qualifying trade setups found. Try a different universe or
                period.
              </p>
            ) : (
              <div className="space-y-3">
                {results.map((trade, i) => {
                  const symbol = trade.symbol as string;
                  const score = trade.score as number | undefined;
                  const direction = trade.direction as string | undefined;
                  const reason = trade.reason as string | undefined;

                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        {direction === "bullish" ? (
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <p className="font-bold">{symbol}</p>
                          {reason && (
                            <p className="text-xs text-muted-foreground">
                              {reason}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {score !== undefined && (
                          <Badge variant="outline">
                            Score: {score.toFixed(1)}
                          </Badge>
                        )}
                        {direction && (
                          <Badge
                            variant={
                              direction === "bullish"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {direction}
                          </Badge>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/dashboard/analyze/${symbol}`}>Analyze</a>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
