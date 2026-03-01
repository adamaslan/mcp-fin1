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
import { Loader2, Activity } from "lucide-react";

const OPTION_TYPES = [
  { value: "all", label: "Calls & Puts" },
  { value: "call", label: "Calls Only" },
  { value: "put", label: "Puts Only" },
];

export default function OptionsPage() {
  const [symbol, setSymbol] = useState("AAPL");
  const [optionType, setOptionType] = useState("all");
  const [minVolume, setMinVolume] = useState("100");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAnalysis() {
    if (!symbol.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/mcp/options-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: symbol.trim().toUpperCase(),
          option_type: optionType === "all" ? undefined : optionType,
          min_volume: parseInt(minVolume),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.message || "Options analysis failed");
      } else {
        setResult(data);
      }
    } catch {
      setError("Failed to connect to analysis server");
    } finally {
      setLoading(false);
    }
  }

  const ivAnalysis = result?.iv_analysis as Record<string, unknown> | undefined;
  const putCallRatio = result?.put_call_ratio as number | undefined;
  const riskWarnings = (result?.risk_warnings as string[]) || [];
  const topContracts =
    (result?.top_contracts as Array<Record<string, unknown>>) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Options Analysis</h1>
        <p className="text-muted-foreground">
          Options chain with Greeks, IV, volume, and put/call ratio
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
            <Select value={optionType} onValueChange={setOptionType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPTION_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={minVolume} onValueChange={setMinVolume}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["10", "50", "100", "500"].map((v) => (
                  <SelectItem key={v} value={v}>
                    Min Vol: {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={runAnalysis} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Activity className="h-4 w-4 mr-2" />
              )}
              Analyze Options
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
            <span>Analyzing {symbol} options chain...</span>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* IV Analysis */}
          {ivAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle>Implied Volatility</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(ivAnalysis).map(([key, val]) => (
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

          {/* Put/Call Ratio */}
          {putCallRatio !== undefined && (
            <Card>
              <CardHeader>
                <CardTitle>Put/Call Ratio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{putCallRatio.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {putCallRatio > 1
                    ? "Bearish sentiment (more puts than calls)"
                    : putCallRatio < 0.7
                      ? "Bullish sentiment (more calls than puts)"
                      : "Neutral sentiment"}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Risk Warnings */}
          {riskWarnings.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Risk Warnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {riskWarnings.map((warning, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Badge variant="destructive" className="mt-0.5 shrink-0">
                        Warning
                      </Badge>
                      <span>{warning}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Contracts */}
          {topContracts.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Top Contracts</CardTitle>
                <CardDescription>
                  Highest volume options contracts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-3 font-medium">
                          Strike
                        </th>
                        <th className="text-left py-2 px-3 font-medium">
                          Type
                        </th>
                        <th className="text-right py-2 px-3 font-medium">
                          Volume
                        </th>
                        <th className="text-right py-2 px-3 font-medium">IV</th>
                        <th className="text-right py-2 pl-3 font-medium">
                          Delta
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {topContracts.slice(0, 10).map((c, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-2 pr-3 font-mono">
                            ${(c.strike as number)?.toFixed(2) ?? "—"}
                          </td>
                          <td className="py-2 px-3">
                            <Badge
                              variant={
                                c.type === "call" ? "default" : "destructive"
                              }
                            >
                              {c.type as string}
                            </Badge>
                          </td>
                          <td className="py-2 px-3 text-right">
                            {(c.volume as number)?.toLocaleString() ?? "—"}
                          </td>
                          <td className="py-2 px-3 text-right">
                            {typeof c.iv === "number"
                              ? (c.iv * 100).toFixed(1) + "%"
                              : "—"}
                          </td>
                          <td className="py-2 pl-3 text-right">
                            {typeof c.delta === "number"
                              ? c.delta.toFixed(3)
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
