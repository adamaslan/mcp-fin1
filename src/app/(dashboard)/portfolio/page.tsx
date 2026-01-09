'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RiskDashboard } from '@/components/portfolio/RiskDashboard';
import { PortfolioRiskResult } from '@/lib/mcp/types';
import { Loader2, AlertCircle, Plus, Trash2 } from 'lucide-react';

interface Position {
  symbol: string;
  shares: number;
  entry_price: number;
}

export default function PortfolioPage() {
  const [positions, setPositions] = useState<Position[]>([
    { symbol: 'AAPL', shares: 100, entry_price: 150 },
    { symbol: 'MSFT', shares: 50, entry_price: 300 },
    { symbol: 'GOOGL', shares: 25, entry_price: 140 },
  ]);

  const [riskData, setRiskData] = useState<PortfolioRiskResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newSymbol, setNewSymbol] = useState('');
  const [newShares, setNewShares] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const fetchRiskAssessment = async () => {
    if (positions.length === 0) {
      setRiskData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/mcp/portfolio-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positions }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate portfolio risk');
      }

      const data = await response.json();
      setRiskData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskAssessment();
  }, [positions]);

  const handleAddPosition = () => {
    if (!newSymbol.trim() || !newShares || !newPrice) {
      setError('Please fill in all fields');
      return;
    }

    const newPosition: Position = {
      symbol: newSymbol.toUpperCase(),
      shares: parseFloat(newShares),
      entry_price: parseFloat(newPrice),
    };

    setPositions([...positions, newPosition]);
    setNewSymbol('');
    setNewShares('');
    setNewPrice('');
    setError(null);
  };

  const handleRemovePosition = (symbol: string) => {
    setPositions(positions.filter((p) => p.symbol !== symbol));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Portfolio Risk Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your aggregate portfolio risk, sector concentration, and position-level metrics.
        </p>
      </div>

      {/* Add position form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Position</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Input
              placeholder="Symbol"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
              className="w-24"
            />
            <Input
              type="number"
              placeholder="Shares"
              value={newShares}
              onChange={(e) => setNewShares(e.target.value)}
              className="w-24"
            />
            <Input
              type="number"
              placeholder="Entry Price"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="w-32"
            />
            <Button onClick={handleAddPosition} disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </CardContent>
      </Card>

      {/* Current positions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Open Positions ({positions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {positions.map((position) => (
              <div key={position.symbol} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-semibold">{position.symbol}</p>
                  <p className="text-xs text-muted-foreground">
                    {position.shares} shares @ ${position.entry_price.toFixed(2)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemovePosition(position.symbol)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk assessment */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {riskData && !loading && <RiskDashboard riskData={riskData} />}

      {positions.length === 0 && !loading && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>Add positions to see risk assessment</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
