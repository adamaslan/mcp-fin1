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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BarChart3,
  Plus,
  Trash2,
  Bell,
  BellOff,
  TrendingUp,
  Activity,
  Zap,
} from "lucide-react";

interface VolumeAlert {
  id: string;
  symbol: string;
  multiplier: number;
  avgVolume: string;
  enabled: boolean;
  createdAt: string;
  lastTriggered?: {
    date: string;
    actualMultiplier: number;
    volume: string;
  };
}

// Mock data
const MOCK_ALERTS: VolumeAlert[] = [
  {
    id: "1",
    symbol: "AAPL",
    multiplier: 2.0,
    avgVolume: "54.2M",
    enabled: true,
    createdAt: "2024-01-10",
    lastTriggered: {
      date: "2024-01-09",
      actualMultiplier: 2.4,
      volume: "130.1M",
    },
  },
  {
    id: "2",
    symbol: "NVDA",
    multiplier: 1.5,
    avgVolume: "48.3M",
    enabled: true,
    createdAt: "2024-01-08",
  },
  {
    id: "3",
    symbol: "TSLA",
    multiplier: 3.0,
    avgVolume: "95.6M",
    enabled: false,
    createdAt: "2024-01-05",
  },
];

const MULTIPLIER_PRESETS = [
  { value: 1.5, label: "1.5x", description: "Moderate increase" },
  { value: 2.0, label: "2x", description: "Significant spike" },
  { value: 3.0, label: "3x", description: "Major event" },
  { value: 5.0, label: "5x", description: "Unusual activity" },
];

interface VolumeSpikeAlertsProps {
  alerts?: VolumeAlert[];
}

export function VolumeSpikeAlerts({
  alerts = MOCK_ALERTS,
}: VolumeSpikeAlertsProps) {
  const [alertsList, setAlertsList] = useState(alerts);
  const [isAdding, setIsAdding] = useState(false);
  const [newAlert, setNewAlert] = useState({
    symbol: "",
    multiplier: 2.0,
  });

  const handleToggle = (id: string) => {
    setAlertsList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)),
    );
  };

  const handleDelete = (id: string) => {
    setAlertsList((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAdd = () => {
    if (!newAlert.symbol) return;

    const alert: VolumeAlert = {
      id: Date.now().toString(),
      symbol: newAlert.symbol.toUpperCase(),
      multiplier: newAlert.multiplier,
      avgVolume: `${(Math.random() * 100).toFixed(1)}M`,
      enabled: true,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setAlertsList((prev) => [...prev, alert]);
    setNewAlert({ symbol: "", multiplier: 2.0 });
    setIsAdding(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Volume Spike Alerts
            </CardTitle>
            <CardDescription>
              Get notified when trading volume exceeds normal levels
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
            <h4 className="font-medium">Create Volume Alert</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Symbol</label>
                <Input
                  placeholder="AAPL"
                  value={newAlert.symbol}
                  onChange={(e) =>
                    setNewAlert((p) => ({
                      ...p,
                      symbol: e.target.value.toUpperCase(),
                    }))
                  }
                  maxLength={5}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Volume Multiplier
                </label>
                <div className="flex gap-2 flex-wrap">
                  {MULTIPLIER_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() =>
                        setNewAlert((p) => ({ ...p, multiplier: preset.value }))
                      }
                      className={`px-3 py-2 rounded border text-sm ${
                        newAlert.multiplier === preset.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-muted hover:border-primary/50"
                      }`}
                      title={preset.description}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
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
                    setNewAlert({ symbol: "", multiplier: 2.0 });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Alert triggers when current volume exceeds the 20-day average
              volume by the selected multiplier.
            </p>
          </div>
        )}

        {/* Alerts List */}
        {alertsList.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No volume alerts set.</p>
            <p className="text-sm">
              Create an alert to detect unusual trading activity.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {alertsList.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${!alert.enabled ? "opacity-60" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Symbol */}
                    <div>
                      <div className="font-bold text-lg">{alert.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        Avg: {alert.avgVolume}
                      </div>
                    </div>

                    {/* Multiplier */}
                    <Badge
                      variant="outline"
                      className="text-primary border-primary/50"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      {alert.multiplier}x volume
                    </Badge>

                    {/* Last Triggered */}
                    {alert.lastTriggered && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          Last spike:
                        </span>
                        <span className="ml-2 text-yellow-500">
                          {alert.lastTriggered.actualMultiplier.toFixed(1)}x
                        </span>
                        <span className="ml-1 text-muted-foreground">
                          ({alert.lastTriggered.volume})
                        </span>
                        <span className="ml-2 text-muted-foreground text-xs">
                          {alert.lastTriggered.date}
                        </span>
                      </div>
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
            ))}
          </div>
        )}

        {/* Volume Spike Guide */}
        <div className="p-4 rounded-lg bg-muted text-sm space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Volume Spike Significance
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-muted-foreground">
            {MULTIPLIER_PRESETS.map((preset) => (
              <div key={preset.value} className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono">
                  {preset.label}
                </Badge>
                <span className="text-xs">{preset.description}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
