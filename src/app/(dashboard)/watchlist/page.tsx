"use client";

import { useEffect, useState } from "react";
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
import { useTier } from "@/hooks/useTier";
import { TIER_LIMITS } from "@/lib/auth/tiers";
import {
  Plus,
  Trash2,
  Edit2,
  Loader2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WatchlistSignal {
  symbol: string;
  price: number;
  change_percent: number;
  action: "BUY" | "HOLD" | "AVOID";
  risk_assessment: string;
  top_signals: string[];
  key_support: number;
  key_resistance: number;
}

interface Watchlist {
  id: string;
  name: string;
  symbols: string[];
  signals?: WatchlistSignal[];
}

export default function WatchlistPage() {
  const { tier } = useTier();
  const tierLimits = TIER_LIMITS[tier];

  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [newName, setNewName] = useState("");
  const [newSymbol, setNewSymbol] = useState("");
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [signalsLoading, setSignalsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch watchlists on mount
  useEffect(() => {
    fetchWatchlistsWithSignals();
  }, []);

  const fetchWatchlistsWithSignals = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/watchlist-signals");
      if (!res.ok) throw new Error("Failed to fetch watchlists");

      const data = await res.json();
      setWatchlists(data.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setWatchlists([]);
    } finally {
      setLoading(false);
    }
  };

  const canCreateMore = watchlists.length < tierLimits.watchlistCount;

  const handleCreateWatchlist = async () => {
    if (!newName.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });

      if (!res.ok) throw new Error("Failed to create watchlist");

      await fetchWatchlistsWithSignals();
      setNewName("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create watchlist",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddSymbol = async (watchlistId: string) => {
    if (!newSymbol.trim()) return;

    const watchlist = watchlists.find((w) => w.id === watchlistId);
    if (!watchlist) return;

    if (watchlist.symbols.length >= tierLimits.watchlistSymbolLimit) {
      alert(
        `Symbol limit (${tierLimits.watchlistSymbolLimit}) reached for this tier`,
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/watchlist", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: watchlistId,
          symbols: [...watchlist.symbols, newSymbol.toUpperCase()],
        }),
      });

      if (!res.ok) throw new Error("Failed to add symbol");

      await fetchWatchlistsWithSignals();
      setNewSymbol("");
      setSelectedWatchlistId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add symbol");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSymbol = async (watchlistId: string, symbol: string) => {
    const watchlist = watchlists.find((w) => w.id === watchlistId);
    if (!watchlist) return;

    setLoading(true);
    try {
      const res = await fetch("/api/watchlist", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: watchlistId,
          symbols: watchlist.symbols.filter((s) => s !== symbol),
        }),
      });

      if (!res.ok) throw new Error("Failed to remove symbol");

      await fetchWatchlistsWithSignals();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove symbol");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWatchlist = async (watchlistId: string) => {
    if (!confirm("Delete this watchlist?")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/watchlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: watchlistId }),
      });

      if (!res.ok) throw new Error("Failed to delete watchlist");

      await fetchWatchlistsWithSignals();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete watchlist",
      );
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "BUY":
        return "bg-green-50 border-green-200 text-green-700";
      case "AVOID":
        return "bg-red-50 border-red-200 text-red-700";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Watchlists</h1>
        <p className="text-muted-foreground">
          Manage your watchlists.{" "}
          {tier === "free" ? "1" : tier === "pro" ? "5" : "Unlimited"}{" "}
          watchlists, {tierLimits.watchlistSymbolLimit} symbols each.
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Create watchlist */}
      {canCreateMore && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create New Watchlist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Watchlist name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                disabled={loading}
              />
              <Button
                onClick={handleCreateWatchlist}
                disabled={loading || !newName.trim()}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Watchlists grid */}
      <div className="grid gap-6">
        {watchlists.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <p>No watchlists yet. Create one to get started!</p>
            </CardContent>
          </Card>
        ) : (
          watchlists.map((watchlist) => (
            <Card key={watchlist.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{watchlist.name}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fetchWatchlistsWithSignals()}
                      title="Refresh signals"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteWatchlist(watchlist.id)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {watchlist.symbols.length} / {tierLimits.watchlistSymbolLimit}{" "}
                  symbols
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Symbols with signals */}
                {watchlist.symbols.length > 0 && (
                  <div className="space-y-3 border-b pb-4">
                    {watchlist.signals?.map((signal) => (
                      <div
                        key={signal.symbol}
                        className={`p-3 rounded-lg border ${getActionColor(signal.action)}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{signal.symbol}</Badge>
                            <span className="font-semibold">
                              ${signal.price.toFixed(2)}
                            </span>
                            <span
                              className={`flex items-center gap-1 ${
                                signal.change_percent > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {signal.change_percent > 0 ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                              {Math.abs(signal.change_percent).toFixed(2)}%
                            </span>
                          </div>
                          <Badge className="font-bold">{signal.action}</Badge>
                        </div>

                        <div className="space-y-1 text-sm">
                          {signal.top_signals.length > 0 && (
                            <div>
                              <p className="font-medium">Top Signals:</p>
                              <ul className="list-disc list-inside ml-2">
                                {signal.top_signals
                                  .slice(0, 2)
                                  .map((sig, idx) => (
                                    <li key={idx} className="text-xs">
                                      {sig}
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          )}
                          {signal.key_support > 0 && (
                            <div>
                              <p className="text-xs">
                                Support: ${signal.key_support.toFixed(2)} |
                                Resistance: ${signal.key_resistance.toFixed(2)}
                              </p>
                            </div>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 w-full text-xs"
                          onClick={() =>
                            handleRemoveSymbol(watchlist.id, signal.symbol)
                          }
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add symbol form */}
                {watchlist.symbols.length < tierLimits.watchlistSymbolLimit && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add symbol..."
                      value={
                        selectedWatchlistId === watchlist.id ? newSymbol : ""
                      }
                      onChange={(e) =>
                        setNewSymbol(e.target.value.toUpperCase())
                      }
                      onFocus={() => setSelectedWatchlistId(watchlist.id)}
                      disabled={loading || selectedWatchlistId !== watchlist.id}
                    />
                    {selectedWatchlistId === watchlist.id && (
                      <Button
                        onClick={() => handleAddSymbol(watchlist.id)}
                        disabled={loading || !newSymbol.trim()}
                      >
                        {loading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Add
                      </Button>
                    )}
                  </div>
                )}

                {watchlist.symbols.length >=
                  tierLimits.watchlistSymbolLimit && (
                  <p className="text-xs text-muted-foreground">
                    Symbol limit reached. Remove symbols to add more.
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {!canCreateMore && (
        <Card className="bg-amber-500/10 border-amber-200 dark:border-amber-800">
          <CardContent className="pt-6 text-sm text-amber-700 dark:text-amber-400">
            <p>
              You've reached the watchlist limit for your tier. Upgrade to
              create more.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
