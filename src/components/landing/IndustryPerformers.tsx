"use client";

import { useEffect, useState } from "react";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";

interface Performer {
  industry: string;
  etf: string;
  returns: {
    "1w"?: number;
    "2w"?: number;
    "1m"?: number;
    [key: string]: number | undefined;
  };
  rank?: number;
}

interface IndustryTrackerResponse {
  success: boolean;
  horizon: string;
  top_n: number;
  data: {
    top_performers?: Performer[];
    worst_performers?: Performer[];
    metrics?: {
      average_return: number;
      positive_count: number;
      negative_count: number;
    };
  };
  timestamp: string;
}

export function IndustryPerformers() {
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [horizon, setHorizon] = useState<"1w" | "2w" | "1m">("1w");

  useEffect(() => {
    fetchPerformers();
  }, [horizon]);

  const fetchPerformers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/mcp/industry-tracker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          horizon,
          top_n: 50,
        }),
      });

      if (!response.ok) {
        // Service unavailable - hide the section gracefully
        setError("unavailable");
        return;
      }

      const result: IndustryTrackerResponse = await response.json();

      if (result.success && result.data) {
        const allPerformers = [
          ...(result.data.top_performers || []),
          ...(result.data.worst_performers || []),
        ];
        const ranked = allPerformers.map((p, i) => ({
          ...p,
          rank: i + 1,
        }));
        setPerformers(ranked);
      } else {
        setError("unavailable");
      }
    } catch {
      setError("unavailable");
    } finally {
      setLoading(false);
    }
  };

  const getReturnColor = (value?: number) => {
    if (value === undefined) return "text-muted-foreground";
    if (value > 0) return "text-green-600 dark:text-green-400";
    if (value < 0) return "text-red-600 dark:text-red-400";
    return "text-muted-foreground";
  };

  const getReturnIcon = (value?: number) => {
    if (value === undefined) return null;
    if (value > 0) return <TrendingUp className="w-4 h-4" />;
    if (value < 0) return <TrendingDown className="w-4 h-4" />;
    return null;
  };

  const horizonLabels = {
    "1w": "Last Week",
    "2w": "Last 2 Weeks",
    "1m": "Last Month",
  };

  // Hide section entirely when service is unavailable
  if (error === "unavailable" && !loading) {
    return null;
  }

  return (
    <section className="py-16 border-t">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Industry Performance</h2>
          <p className="text-muted-foreground">
            Top 50 industries ranked by recent performance. Live data from
            GCloud.
          </p>
        </div>

        {/* Horizon selector */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {(["1w", "2w", "1m"] as const).map((h) => (
            <button
              key={h}
              onClick={() => setHorizon(h)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                horizon === h
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-foreground"
              }`}
            >
              {horizonLabels[h]}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading data...</span>
          </div>
        )}

        {/* Table */}
        {!loading && performers.length > 0 && (
          <div className="rounded-lg border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Rank</th>
                    <th className="px-4 py-3 text-left font-medium">
                      Industry
                    </th>
                    <th className="px-4 py-3 text-left font-medium">ETF</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Return ({horizonLabels[horizon]})
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {performers.map((performer, idx) => {
                    const returnValue = performer.returns[horizon];
                    return (
                      <tr
                        key={`${performer.industry}-${idx}`}
                        className="border-b last:border-b-0 hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-muted-foreground font-medium">
                          #{performer.rank || idx + 1}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {performer.industry}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded bg-muted text-sm font-mono">
                            {performer.etf}
                          </span>
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-semibold ${getReturnColor(returnValue)}`}
                        >
                          <div className="flex items-center justify-end gap-2">
                            {returnValue !== undefined &&
                              returnValue.toFixed(2)}
                            {returnValue !== undefined && "%"}
                            {getReturnIcon(returnValue)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && performers.length === 0 && !error && (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-muted-foreground">No data available</p>
          </div>
        )}

        {/* Data source notice */}
        <div className="mt-6 text-xs text-muted-foreground p-3 rounded-lg bg-muted/30 border border-muted">
          <p>
            📊 Data sourced from GCloud industry tracker API with multi-source
            fallback (Finnhub → Alpha Vantage → yfinance). Updates reflect live
            market data.
          </p>
        </div>
      </div>
    </section>
  );
}
