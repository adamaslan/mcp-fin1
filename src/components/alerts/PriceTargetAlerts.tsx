'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Target,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Bell,
  BellOff,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

type AlertDirection = 'above' | 'below';

interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  direction: AlertDirection;
  currentPrice: number;
  enabled: boolean;
  createdAt: string;
  triggeredAt?: string;
}

// Mock data
const MOCK_ALERTS: PriceAlert[] = [
  {
    id: '1',
    symbol: 'AAPL',
    targetPrice: 200,
    direction: 'above',
    currentPrice: 185.42,
    enabled: true,
    createdAt: '2024-01-10',
  },
  {
    id: '2',
    symbol: 'NVDA',
    targetPrice: 800,
    direction: 'below',
    currentPrice: 875.32,
    enabled: true,
    createdAt: '2024-01-08',
  },
  {
    id: '3',
    symbol: 'TSLA',
    targetPrice: 250,
    direction: 'above',
    currentPrice: 242.18,
    enabled: false,
    createdAt: '2024-01-05',
    triggeredAt: '2024-01-09',
  },
];

interface PriceTargetAlertsProps {
  alerts?: PriceAlert[];
}

export function PriceTargetAlerts({ alerts = MOCK_ALERTS }: PriceTargetAlertsProps) {
  const [alertsList, setAlertsList] = useState(alerts);
  const [isAdding, setIsAdding] = useState(false);
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    targetPrice: '',
    direction: 'above' as AlertDirection,
  });

  const handleToggle = (id: string) => {
    setAlertsList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const handleDelete = (id: string) => {
    setAlertsList((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAdd = () => {
    if (!newAlert.symbol || !newAlert.targetPrice) return;

    const alert: PriceAlert = {
      id: Date.now().toString(),
      symbol: newAlert.symbol.toUpperCase(),
      targetPrice: parseFloat(newAlert.targetPrice),
      direction: newAlert.direction,
      currentPrice: 100 + Math.random() * 100, // Mock current price
      enabled: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setAlertsList((prev) => [...prev, alert]);
    setNewAlert({ symbol: '', targetPrice: '', direction: 'above' });
    setIsAdding(false);
  };

  const getDistancePercent = (alert: PriceAlert) => {
    const diff = alert.targetPrice - alert.currentPrice;
    return ((diff / alert.currentPrice) * 100).toFixed(1);
  };

  const isCloseToTarget = (alert: PriceAlert) => {
    const percent = Math.abs(parseFloat(getDistancePercent(alert)));
    return percent < 5;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Price Target Alerts
            </CardTitle>
            <CardDescription>
              Get notified when stocks reach your target prices
            </CardDescription>
          </div>
          <Button onClick={() => setIsAdding(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            New Alert
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Form */}
        {isAdding && (
          <div className="p-4 rounded-lg border bg-muted/50 space-y-4">
            <h4 className="font-medium">Create Price Alert</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Symbol</label>
                <Input
                  placeholder="AAPL"
                  value={newAlert.symbol}
                  onChange={(e) =>
                    setNewAlert((p) => ({ ...p, symbol: e.target.value.toUpperCase() }))
                  }
                  maxLength={5}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Direction</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewAlert((p) => ({ ...p, direction: 'above' }))}
                    className={`flex items-center gap-1 px-3 py-2 rounded border flex-1 ${
                      newAlert.direction === 'above'
                        ? 'border-green-500 bg-green-500/10 text-green-500'
                        : 'border-muted hover:border-green-500/50'
                    }`}
                  >
                    <ArrowUp className="h-4 w-4" />
                    <span className="text-sm">Above</span>
                  </button>
                  <button
                    onClick={() => setNewAlert((p) => ({ ...p, direction: 'below' }))}
                    className={`flex items-center gap-1 px-3 py-2 rounded border flex-1 ${
                      newAlert.direction === 'below'
                        ? 'border-red-500 bg-red-500/10 text-red-500'
                        : 'border-muted hover:border-red-500/50'
                    }`}
                  >
                    <ArrowDown className="h-4 w-4" />
                    <span className="text-sm">Below</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Target Price</label>
                <Input
                  type="number"
                  placeholder="200.00"
                  value={newAlert.targetPrice}
                  onChange={(e) => setNewAlert((p) => ({ ...p, targetPrice: e.target.value }))}
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={handleAdd} size="sm" className="flex-1">
                  Create
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false);
                    setNewAlert({ symbol: '', targetPrice: '', direction: 'above' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Alerts List */}
        {alertsList.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No price alerts set.</p>
            <p className="text-sm">Create an alert to get notified when a stock hits your target.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alertsList.map((alert) => {
              const distancePercent = getDistancePercent(alert);
              const isPositive = parseFloat(distancePercent) > 0;
              const close = isCloseToTarget(alert);

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border ${
                    close && alert.enabled ? 'border-yellow-500/50 bg-yellow-500/5' : ''
                  } ${!alert.enabled ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Symbol */}
                      <div>
                        <div className="font-bold text-lg">{alert.symbol}</div>
                        <div className="text-sm text-muted-foreground">
                          Current: ${alert.currentPrice.toFixed(2)}
                        </div>
                      </div>

                      {/* Direction & Target */}
                      <div className="flex items-center gap-2">
                        {alert.direction === 'above' ? (
                          <Badge variant="outline" className="text-green-500 border-green-500/50">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Above
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-500 border-red-500/50">
                            <TrendingDown className="h-3 w-3 mr-1" />
                            Below
                          </Badge>
                        )}
                        <span className="font-semibold">${alert.targetPrice.toFixed(2)}</span>
                      </div>

                      {/* Distance */}
                      <div className="text-sm">
                        <span
                          className={
                            isPositive
                              ? 'text-green-500'
                              : 'text-red-500'
                          }
                        >
                          {isPositive ? '+' : ''}{distancePercent}%
                        </span>
                        <span className="text-muted-foreground ml-1">to target</span>
                      </div>

                      {/* Close Warning */}
                      {close && alert.enabled && (
                        <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/50">
                          <Bell className="h-3 w-3 mr-1" />
                          Close to target
                        </Badge>
                      )}

                      {/* Triggered */}
                      {alert.triggeredAt && (
                        <Badge variant="secondary">
                          Triggered {alert.triggeredAt}
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggle(alert.id)}
                      >
                        {alert.enabled ? (
                          <Bell className="h-4 w-4" />
                        ) : (
                          <BellOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(alert.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info */}
        <div className="p-4 rounded-lg bg-muted text-sm text-muted-foreground">
          <p>
            <strong>Note:</strong> Alerts are checked every 5 minutes during market hours.
            You&apos;ll receive notifications via your configured webhook integrations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
