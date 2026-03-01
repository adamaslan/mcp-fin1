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
import {
  Loader2,
  Bookmark,
  Plus,
  X,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface WatchlistItem {
  symbol: string;
  signals?: Array<{ direction: string; name: string }>;
  score?: number;
}

export default function WatchlistPage() {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [inputSymbol, setInputSymbol] = useState("");
  const [signalData, setSignalData] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [sigLoading, setSigLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load watchlist on mount
  useEffect(() => {
    fetchWatchlist();
  }, []);

  async function fetchWatchlist() {
    setLoading(true);
    try {
      const res = await fetch("/api/watchlist");
      if (res.ok) {
        const data = await res.json();
        const syms: string[] =
          data.symbols ||
          data.items?.map((i: { symbol: string }) => i.symbol) ||
          [];
        setSymbols(syms);
      }
    } catch {
      // Watchlist may not be set up yet
    } finally {
      setLoading(false);
    }
  }

  async function addSymbol() {
    const sym = inputSymbol.trim().toUpperCase();
    if (!sym || symbols.includes(sym)) return;
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: sym }),
      });
      if (res.ok) {
        setSymbols([...symbols, sym]);
        setInputSymbol("");
      }
    } catch {
      setError("Failed to add symbol");
    }
  }

  async function removeSymbol(sym: string) {
    try {
      await fetch(`/api/watchlist?symbol=${sym}`, { method: "DELETE" });
      setSymbols(symbols.filter((s) => s !== sym));
      setSignalData(signalData.filter((d) => d.symbol !== sym));
    } catch {
      setError("Failed to remove symbol");
    }
  }

  async function fetchSignals() {
    if (symbols.length === 0) return;
    setSigLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/watchlist/signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbols }),
      });
      if (res.ok) {
        const data = await res.json();
        setSignalData(data.results || data.data || []);
      } else {
        setError("Failed to fetch signals");
      }
    } catch {
      setError("Failed to connect to analysis server");
    } finally {
      setSigLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Watchlist</h1>
        <p className="text-muted-foreground">
          Track your favorite symbols and monitor their signals
        </p>
      </div>

      {/* Add symbol */}
      <Card>
        <CardHeader>
          <CardTitle>My Watchlist</CardTitle>
          <CardDescription>Add symbols to track</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add ticker (e.g. TSLA)"
              value={inputSymbol}
              onChange={(e) => setInputSymbol(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && addSymbol()}
              className="max-w-xs"
            />
            <Button variant="outline" onClick={addSymbol}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading watchlist...
            </div>
          ) : symbols.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Your watchlist is empty. Add symbols above.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {symbols.map((sym) => (
                <Badge
                  key={sym}
                  variant="secondary"
                  className="text-sm px-3 py-1"
                >
                  <Bookmark className="h-3 w-3 mr-1" />
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
          )}

          {symbols.length > 0 && (
            <Button onClick={fetchSignals} disabled={sigLoading}>
              {sigLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <TrendingUp className="h-4 w-4 mr-2" />
              )}
              Refresh Signals
            </Button>
          )}
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

      {/* Signal data */}
      {signalData.length > 0 && !sigLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Watchlist Signals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {signalData.map((item) => (
                <div
                  key={item.symbol}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg">{item.symbol}</span>
                    {item.signals && item.signals.length > 0 && (
                      <div className="flex gap-1">
                        {item.signals.slice(0, 3).map((sig, i) => (
                          <Badge
                            key={i}
                            variant={
                              sig.direction === "bullish"
                                ? "default"
                                : "destructive"
                            }
                            className="text-xs"
                          >
                            {sig.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {item.score !== undefined && (
                      <Badge variant="outline">
                        Score: {item.score.toFixed(1)}
                      </Badge>
                    )}
                    {item.signals &&
                      (item.signals[0]?.direction === "bullish" ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      ))}
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/dashboard/analyze/${item.symbol}`}>Analyze</a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
