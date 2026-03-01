"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Loader2, Search, TrendingUp, TrendingDown, Minus } from "lucide-react";

const PERIODS = [
  { value: "1mo", label: "1 Month" },
  { value: "3mo", label: "3 Months" },
  { value: "6mo", label: "6 Months" },
  { value: "1y", label: "1 Year" },
  { value: "2y", label: "2 Years" },
];

export default function AnalyzePage() {
  const params = useParams();
  const router = useRouter();
  const symbolParam = (params?.symbol as string) || "AAPL";

  const [inputSymbol, setInputSymbol] = useState(symbolParam.toUpperCase());
  const [period, setPeriod] = useState("3mo");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (symbolParam) {
      setInputSymbol(symbolParam.toUpperCase());
      runAnalysis(symbolParam.toUpperCase(), period);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbolParam]);

  async function runAnalysis(sym: string, per: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mcp/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: sym, period: per, useAi: false }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.message || "Analysis failed");
      } else {
        setResult(data);
      }
    } catch {
      setError("Failed to connect to analysis server");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    if (!inputSymbol.trim()) return;
    const sym = inputSymbol.trim().toUpperCase();
    router.push(`/dashboard/analyze/${sym}`);
    runAnalysis(sym, period);
  }

  const signals =
    (result?.signals as Array<{
      name: string;
      direction: string;
      strength: string;
      description?: string;
    }>) || [];
  const score = result?.score as number | undefined;
  const summary = result?.summary as string | undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Analyze Security</h1>
        <p className="text-muted-foreground">
          150+ technical signals for any ticker symbol
        </p>
      </div>

      {/* Search bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Input
              placeholder="Enter ticker symbol (e.g. AAPL)"
              value={inputSymbol}
              onChange={(e) => setInputSymbol(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span className="ml-2">Analyze</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error state */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {loading && (
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span>Analyzing {inputSymbol}...</span>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && !loading && (
        <>
          {/* Score overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Overall Score</CardDescription>
                <CardTitle className="text-4xl">
                  {score !== undefined ? score.toFixed(1) : "—"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">out of 100</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Symbol</CardDescription>
                <CardTitle className="text-4xl">
                  {symbolParam.toUpperCase()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Period: {period}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Signals Found</CardDescription>
                <CardTitle className="text-4xl">{signals.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  technical signals
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          {summary && (
            <Card>
              <CardHeader>
                <CardTitle>Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Signals list */}
          {signals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Technical Signals</CardTitle>
                <CardDescription>
                  Detected signals for {symbolParam.toUpperCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {signals.map((signal, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        {signal.direction === "bullish" ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : signal.direction === "bearish" ? (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        ) : (
                          <Minus className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{signal.name}</p>
                          {signal.description && (
                            <p className="text-xs text-muted-foreground">
                              {signal.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            signal.direction === "bullish"
                              ? "default"
                              : signal.direction === "bearish"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {signal.direction}
                        </Badge>
                        {signal.strength && (
                          <Badge variant="outline">{signal.strength}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
