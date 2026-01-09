'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, AlertCircle, Loader2 } from 'lucide-react';

interface Alert {
  id: string;
  symbol: string;
  condition_type: 'price_above' | 'price_below' | 'volume_spike';
  condition_value: number;
  is_active: boolean;
  created_at: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    symbol: '',
    condition_type: 'price_above' as const,
    condition_value: '',
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/alerts');
      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAlert = async () => {
    if (!formData.symbol || !formData.condition_value) {
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newAlert = await response.json();
        setAlerts([newAlert, ...alerts]);
        setFormData({ symbol: '', condition_type: 'price_above', condition_value: '' });
        setShowForm(false);
      }
    } catch (error) {
      console.error('Failed to create alert:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleAlert = async (alert: Alert) => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: alert.id,
          is_active: !alert.is_active,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setAlerts(alerts.map((a) => (a.id === alert.id ? updated : a)));
      }
    } catch (error) {
      console.error('Failed to toggle alert:', error);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      const response = await fetch(`/api/alerts?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAlerts(alerts.filter((a) => a.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete alert:', error);
    }
  };

  const conditionLabels = {
    price_above: 'Price Above',
    price_below: 'Price Below',
    volume_spike: 'Volume Spike',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Price Alerts</h1>
          <p className="text-muted-foreground">
            Set up alerts to monitor price movements and trigger notifications.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          New Alert
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create Price Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Input
                  placeholder="Symbol (e.g., AAPL)"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                />
                <select
                  className="border rounded px-3 py-2 text-sm"
                  value={formData.condition_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      condition_type: e.target.value as any,
                    })
                  }
                >
                  <option value="price_above">Price Above</option>
                  <option value="price_below">Price Below</option>
                  <option value="volume_spike">Volume Spike</option>
                </select>
                <Input
                  type="number"
                  placeholder="Value"
                  value={formData.condition_value}
                  onChange={(e) =>
                    setFormData({ ...formData, condition_value: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddAlert} disabled={creating}>
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Alert
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : alerts.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Active Alerts ({alerts.filter((a) => a.is_active).length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle
                      className={`h-5 w-5 ${alert.is_active ? 'text-yellow-500' : 'text-muted-foreground'}`}
                    />
                    <div>
                      <p className="font-semibold">{alert.symbol}</p>
                      <p className="text-sm text-muted-foreground">
                        {conditionLabels[alert.condition_type]} ${alert.condition_value.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={alert.is_active ? 'default' : 'secondary'}>
                      {alert.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleAlert(alert)}
                    >
                      {alert.is_active ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAlert(alert.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>No alerts set up yet. Create one to get started.</p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-blue-500/10 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Alerts will trigger when your conditions are met. Notifications are checked periodically
            during market hours.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
