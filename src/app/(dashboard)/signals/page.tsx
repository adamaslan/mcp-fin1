"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";

interface SignalData {
  name: string;
  category: string;
  description: string;
  values: Record<string, number | string>;
}

export default function SignalsPage() {
  const [signals, setSignals] = useState<SignalData[]>([]);
  const [filteredSignals, setFilteredSignals] = useState<SignalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchSignals();
  }, []);

  useEffect(() => {
    let filtered = signals;

    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((s) => s.category === selectedCategory);
    }

    setFilteredSignals(filtered);
  }, [searchTerm, selectedCategory, signals]);

  const fetchSignals = async () => {
    try {
      setSignals([
        {
          name: "RSI",
          category: "Momentum",
          description: "Relative Strength Index - measures overbought/oversold",
          values: { value: 65, overbought: 70, oversold: 30 },
        },
        {
          name: "MACD",
          category: "Trend",
          description: "Moving Average Convergence Divergence",
          values: { macd_line: 2.5, signal_line: 2.1, histogram: 0.4 },
        },
        {
          name: "Bollinger Bands",
          category: "Volatility",
          description: "Volatility bands around moving average",
          values: { upper: 152.5, middle: 150, lower: 147.5 },
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch signals:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(signals.map((s) => s.category))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">All Trading Signals</h1>
        <p className="text-muted-foreground">
          Access all 150+ technical indicators with detailed calculations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search and Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search signals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                All Categories
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredSignals.length > 0 ? (
        <div className="grid gap-4">
          {filteredSignals.map((signal) => (
            <Card key={signal.name}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{signal.name}</CardTitle>
                    <CardDescription>{signal.description}</CardDescription>
                  </div>
                  <Badge variant="secondary">{signal.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(signal.values).map(([key, value]) => (
                    <div key={key} className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1 capitalize">
                        {key.replace(/_/g, " ")}
                      </p>
                      <p className="font-semibold">
                        {typeof value === "number" ? value.toFixed(2) : value}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>No signals found.</p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-blue-500/10 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-base">Max Tier Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
            <li>✓ Access all 150+ technical indicators</li>
            <li>✓ View detailed calculations and values</li>
            <li>✓ Compare signals across timeframes</li>
            <li>✓ Export signal data</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
