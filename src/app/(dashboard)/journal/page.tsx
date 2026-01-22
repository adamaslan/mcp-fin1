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
import { Plus, TrendingUp, TrendingDown, Loader2 } from "lucide-react";

interface TradeEntry {
  id: string;
  symbol: string;
  entryPrice: number;
  exitPrice?: number;
  shares: number;
  pnl?: number;
  pnlPercent?: number;
  entryDate: string;
  exitDate?: string;
  notes?: string;
  status: "open" | "closed";
}

export default function JournalPage() {
  const [trades, setTrades] = useState<TradeEntry[]>([
    {
      id: "1",
      symbol: "AAPL",
      entryPrice: 150,
      exitPrice: 155,
      shares: 100,
      pnl: 500,
      pnlPercent: 3.33,
      entryDate: "2024-01-15",
      exitDate: "2024-01-20",
      notes: "Golden cross signal",
      status: "closed",
    },
    {
      id: "2",
      symbol: "MSFT",
      entryPrice: 300,
      shares: 50,
      entryDate: "2024-01-22",
      notes: "Swing trade - holding",
      status: "open",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    symbol: "",
    entryPrice: "",
    shares: "",
    notes: "",
  });

  const handleAddTrade = async () => {
    if (!formData.symbol || !formData.entryPrice || !formData.shares) {
      return;
    }

    setLoading(true);

    const newTrade: TradeEntry = {
      id: Date.now().toString(),
      symbol: formData.symbol.toUpperCase(),
      entryPrice: parseFloat(formData.entryPrice),
      shares: parseFloat(formData.shares),
      entryDate: new Date().toISOString().split("T")[0],
      notes: formData.notes,
      status: "open",
    };

    setTrades([...trades, newTrade]);
    setFormData({ symbol: "", entryPrice: "", shares: "", notes: "" });
    setShowForm(false);
    setLoading(false);
  };

  const handleCloseTrade = (id: string) => {
    // Would normally prompt for exit price/date
    const exitPrice = prompt("Enter exit price:");
    if (!exitPrice) return;

    setTrades(
      trades.map((t) => {
        if (t.id === id) {
          const exit = parseFloat(exitPrice);
          const pnl = (exit - t.entryPrice) * t.shares;
          const pnlPercent = ((exit - t.entryPrice) / t.entryPrice) * 100;
          return {
            ...t,
            exitPrice: exit,
            pnl,
            pnlPercent,
            status: "closed",
            exitDate: new Date().toISOString().split("T")[0],
          };
        }
        return t;
      }),
    );
  };

  const closedTrades = trades.filter((t) => t.status === "closed");
  const openTrades = trades.filter((t) => t.status === "open");
  const winRate =
    closedTrades.length > 0
      ? (closedTrades.filter((t) => (t.pnl || 0) > 0).length /
          closedTrades.length) *
        100
      : 0;
  const totalPnL = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Trade Journal</h1>
          <p className="text-muted-foreground">
            Log and track your trades. Monitor performance metrics and P&L.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          New Trade
        </Button>
      </div>

      {/* Add trade form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Log New Trade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Symbol"
                  value={formData.symbol}
                  onChange={(e) =>
                    setFormData({ ...formData, symbol: e.target.value })
                  }
                />
                <Input
                  type="number"
                  placeholder="Entry Price"
                  value={formData.entryPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, entryPrice: e.target.value })
                  }
                />
                <Input
                  type="number"
                  placeholder="Shares"
                  value={formData.shares}
                  onChange={(e) =>
                    setFormData({ ...formData, shares: e.target.value })
                  }
                />
                <Input
                  placeholder="Notes (optional)"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddTrade} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Log Trade
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      {closedTrades.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total P&L</CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-3xl font-bold ${totalPnL >= 0 ? "text-green-500" : "text-red-500"}`}
              >
                ${totalPnL.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{winRate.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">
                {closedTrades.filter((t) => (t.pnl || 0) > 0).length}/
                {closedTrades.length} wins
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Closed Trades</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{closedTrades.length}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Open trades */}
      {openTrades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Open Trades ({openTrades.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {openTrades.map((trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-lg">{trade.symbol}</p>
                    <p className="text-sm text-muted-foreground">
                      {trade.shares} shares @ ${trade.entryPrice.toFixed(2)}
                    </p>
                    {trade.notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {trade.notes}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => handleCloseTrade(trade.id)}
                    variant="outline"
                    size="sm"
                  >
                    Close
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Closed trades */}
      {closedTrades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Closed Trades</CardTitle>
            <CardDescription>Historical trades with P&L</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-3 font-semibold">Symbol</th>
                    <th className="text-right py-3 font-semibold">Entry</th>
                    <th className="text-right py-3 font-semibold">Exit</th>
                    <th className="text-right py-3 font-semibold">Shares</th>
                    <th className="text-right py-3 font-semibold">P&L</th>
                    <th className="text-right py-3 font-semibold">Return %</th>
                    <th className="text-left py-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {closedTrades.map((trade) => (
                    <tr
                      key={trade.id}
                      className="border-b last:border-b-0 hover:bg-muted/50"
                    >
                      <td className="py-3 font-semibold">{trade.symbol}</td>
                      <td className="text-right">
                        ${trade.entryPrice.toFixed(2)}
                      </td>
                      <td className="text-right">
                        ${trade.exitPrice?.toFixed(2)}
                      </td>
                      <td className="text-right">{trade.shares}</td>
                      <td
                        className={`text-right font-semibold ${(trade.pnl || 0) >= 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        ${trade.pnl?.toFixed(2)}
                      </td>
                      <td
                        className={`text-right ${(trade.pnlPercent || 0) >= 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        {(trade.pnlPercent || 0) >= 0 ? "+" : ""}
                        {trade.pnlPercent?.toFixed(2)}%
                      </td>
                      <td className="text-left text-xs text-muted-foreground">
                        {trade.exitDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {trades.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>
              No trades logged yet. Start logging your trades to track
              performance.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
