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
import { useTier } from "@/hooks/useTier";
import { TIER_LIMITS } from "@/lib/auth/tiers";
import { Plus, Trash2, Edit2, Loader2 } from "lucide-react";

interface Watchlist {
  id: string;
  name: string;
  symbols: string[];
}

export default function WatchlistPage() {
  const { tier } = useTier();
  const tierLimits = TIER_LIMITS[tier];

  const [watchlists, setWatchlists] = useState<Watchlist[]>([
    { id: "1", name: "Tech Stocks", symbols: ["AAPL", "MSFT", "GOOGL"] },
    { id: "2", name: "Semiconductors", symbols: ["NVDA", "AMD", "QCOM"] },
  ]);

  const [newName, setNewName] = useState("");
  const [newSymbol, setNewSymbol] = useState("");
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<string | null>(
    null,
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canCreateMore = watchlists.length < tierLimits.watchlistCount;

  const handleCreateWatchlist = async () => {
    if (!newName.trim()) return;

    setLoading(true);
    try {
      // TODO: Call API to create watchlist
      const watchlist: Watchlist = {
        id: Date.now().toString(),
        name: newName,
        symbols: [],
      };
      setWatchlists([...watchlists, watchlist]);
      setNewName("");
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
      // TODO: Call API to add symbol
      const updated = {
        ...watchlist,
        symbols: [...watchlist.symbols, newSymbol.toUpperCase()],
      };
      setWatchlists(
        watchlists.map((w) => (w.id === watchlistId ? updated : w)),
      );
      setNewSymbol("");
      setSelectedWatchlistId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSymbol = async (watchlistId: string, symbol: string) => {
    const watchlist = watchlists.find((w) => w.id === watchlistId);
    if (!watchlist) return;

    setLoading(true);
    try {
      // TODO: Call API to remove symbol
      const updated = {
        ...watchlist,
        symbols: watchlist.symbols.filter((s) => s !== symbol),
      };
      setWatchlists(
        watchlists.map((w) => (w.id === watchlistId ? updated : w)),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWatchlist = async (watchlistId: string) => {
    if (!confirm("Delete this watchlist?")) return;

    setLoading(true);
    try {
      // TODO: Call API to delete watchlist
      setWatchlists(watchlists.filter((w) => w.id !== watchlistId));
    } finally {
      setLoading(false);
    }
  };

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
        {watchlists.map((watchlist) => (
          <Card key={watchlist.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{watchlist.name}</CardTitle>
                <div className="flex gap-2">
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
              {/* Symbols */}
              {watchlist.symbols.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {watchlist.symbols.map((symbol) => (
                    <Badge
                      key={symbol}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleRemoveSymbol(watchlist.id, symbol)}
                    >
                      {symbol}
                      <span className="ml-1 text-xs">×</span>
                    </Badge>
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
                    onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
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

              {watchlist.symbols.length >= tierLimits.watchlistSymbolLimit && (
                <p className="text-xs text-muted-foreground">
                  Symbol limit reached. Remove symbols to add more.
                </p>
              )}
            </CardContent>
          </Card>
        ))}
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
