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
import { Loader2, Scale, X, Plus } from "lucide-react";

const PERIODS = [
  { value: "1mo", label: "1 Month" },
  { value: "3mo", label: "3 Months" },
  { value: "6mo", label: "6 Months" },
  { value: "1y", label: "1 Year" },
];

export default function ComparePage() {
  const [symbols, setSymbols] = useState<string[]>(["AAPL", "MSFT"]);
  const [inputSymbol, setInputSymbol] = useState("");
  const [period, setPeriod] = useState("3mo");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Array<Record<string, unknown>> | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  function addSymbol() {
    const sym = inputSymbol.trim().toUpperCase();
    if (!sym || symbols.includes(sym) || symbols.length >= 6) return;
    setSymbols([...symbols, sym]);
    setInputSymbol("");
  }

  function removeSymbol(sym: string) {
    setSymbols(symbols.filter((s) => s !== sym));
  }

  async function runCompare() {
    if (symbols.length < 2) {
      setError("Add at least 2 symbols to compare");
      return;
    }
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch("/api/mcp/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbols, period }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.message || "Compare failed");
      } else {
        const list = data.results || data.comparisons || data.data || [];
        setResults(Array.isArray(list) ? list : []);
      }
    } catch {
      setError("Failed to connect to analysis server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Compare Securities</h1>
        <p className="text-muted-foreground">
          Side-by-side comparison of technical signals across multiple stocks
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Select Symbols</CardTitle>
          <CardDescription>Add up to 6 symbols to compare</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {symbols.map((sym) => (
              <Badge
                key={sym}
                variant="secondary"
                className="text-sm px-3 py-1"
              >
                {sym}
                <button
                  onClick={() => removeSymbol(sym)}
                  className="ml-2 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-3">
            <Input
              placeholder="Add ticker (e.g. GOOG)"
              value={inputSymbol}
              onChange={(e) => setInputSymbol(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && addSymbol()}
              className="max-w-xs"
            />
            <Button
              variant="outline"
              onClick={addSymbol}
              disabled={symbols.length >= 6}
            >
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
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
            <Button
              onClick={runCompare}
              disabled={loading || symbols.length < 2}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Scale className="h-4 w-4 mr-2" />
              )}
              Compare
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
            <span>Comparing {symbols.join(", ")}...</span>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results && !loading && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison Results</CardTitle>
            <CardDescription>{period} period</CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No comparison data returned.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-medium">
                        Symbol
                      </th>
                      <th className="text-right py-2 px-4 font-medium">
                        Score
                      </th>
                      <th className="text-right py-2 px-4 font-medium">
                        Signals
                      </th>
                      <th className="text-right py-2 px-4 font-medium">
                        Direction
                      </th>
                      <th className="text-right py-2 pl-4 font-medium">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => {
                      const sym = r.symbol as string;
                      const score = r.score as number | undefined;
                      const signalCount = r.signal_count as number | undefined;
                      const direction = r.direction as string | undefined;
                      return (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-3 pr-4 font-bold">{sym}</td>
                          <td className="py-3 px-4 text-right">
                            {score !== undefined ? score.toFixed(1) : "—"}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {signalCount ?? "—"}
                          </td>
                          <td className="py-3 px-4 text-right">
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
                          </td>
                          <td className="py-3 pl-4 text-right">
                            <Button variant="outline" size="sm" asChild>
                              <a href={`/dashboard/analyze/${sym}`}>Details</a>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
