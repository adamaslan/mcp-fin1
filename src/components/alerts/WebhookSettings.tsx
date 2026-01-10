'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Webhook,
  Plus,
  Trash2,
  Check,
  X,
  Send,
  MessageSquare,
  Hash,
  Globe,
} from 'lucide-react';

type WebhookType = 'slack' | 'discord' | 'custom';

interface WebhookConfig {
  id: string;
  name: string;
  type: WebhookType;
  url: string;
  enabled: boolean;
  events: string[];
  lastTriggered?: string;
}

// Mock data
const MOCK_WEBHOOKS: WebhookConfig[] = [
  {
    id: '1',
    name: 'Trading Alerts Channel',
    type: 'slack',
    url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXX',
    enabled: true,
    events: ['price_target', 'trade_signal'],
    lastTriggered: '2 hours ago',
  },
  {
    id: '2',
    name: 'Discord Server',
    type: 'discord',
    url: 'https://discord.com/api/webhooks/0000000000/XXXXXXXXXXXX',
    enabled: true,
    events: ['price_target', 'volume_spike'],
    lastTriggered: '1 day ago',
  },
];

const WEBHOOK_TYPES: Record<WebhookType, { icon: React.ReactNode; label: string; color: string }> = {
  slack: { icon: <Hash className="h-4 w-4" />, label: 'Slack', color: 'bg-[#4A154B]' },
  discord: { icon: <MessageSquare className="h-4 w-4" />, label: 'Discord', color: 'bg-[#5865F2]' },
  custom: { icon: <Globe className="h-4 w-4" />, label: 'Custom', color: 'bg-gray-500' },
};

const AVAILABLE_EVENTS = [
  { id: 'price_target', label: 'Price Target Hit' },
  { id: 'trade_signal', label: 'New Trade Signal' },
  { id: 'volume_spike', label: 'Volume Spike' },
  { id: 'earnings_reminder', label: 'Earnings Reminder' },
  { id: 'portfolio_alert', label: 'Portfolio Risk Alert' },
];

interface WebhookSettingsProps {
  webhooks?: WebhookConfig[];
}

export function WebhookSettings({ webhooks = MOCK_WEBHOOKS }: WebhookSettingsProps) {
  const [configs, setConfigs] = useState(webhooks);
  const [isAdding, setIsAdding] = useState(false);
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    type: 'slack' as WebhookType,
    url: '',
  });
  const [testingId, setTestingId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this webhook?')) {
      setConfigs((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleAdd = () => {
    if (!newWebhook.name || !newWebhook.url) return;

    const webhook: WebhookConfig = {
      id: Date.now().toString(),
      name: newWebhook.name,
      type: newWebhook.type,
      url: newWebhook.url,
      enabled: true,
      events: ['price_target'],
    };

    setConfigs((prev) => [...prev, webhook]);
    setNewWebhook({ name: '', type: 'slack', url: '' });
    setIsAdding(false);
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    // Simulate test
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setTestingId(null);
    alert('Test message sent successfully!');
  };

  const handleToggleEvent = (webhookId: string, eventId: string) => {
    setConfigs((prev) =>
      prev.map((c) => {
        if (c.id !== webhookId) return c;
        const events = c.events.includes(eventId)
          ? c.events.filter((e) => e !== eventId)
          : [...c.events, eventId];
        return { ...c, events };
      })
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              Webhook Integrations
            </CardTitle>
            <CardDescription>
              Send alerts to Slack, Discord, or custom endpoints
            </CardDescription>
          </div>
          <Button onClick={() => setIsAdding(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Webhook
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Form */}
        {isAdding && (
          <div className="p-4 rounded-lg border bg-muted/50 space-y-4">
            <h4 className="font-medium">Add New Webhook</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Name</label>
                <Input
                  placeholder="My Alerts Channel"
                  value={newWebhook.name}
                  onChange={(e) => setNewWebhook((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Type</label>
                <div className="flex gap-2">
                  {(Object.keys(WEBHOOK_TYPES) as WebhookType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewWebhook((p) => ({ ...p, type }))}
                      className={`flex items-center gap-1 px-3 py-2 rounded border ${
                        newWebhook.type === type
                          ? 'border-primary bg-primary/10'
                          : 'border-muted hover:border-primary/50'
                      }`}
                    >
                      {WEBHOOK_TYPES[type].icon}
                      <span className="text-sm">{WEBHOOK_TYPES[type].label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Webhook URL</label>
                <Input
                  placeholder="https://hooks.slack.com/..."
                  value={newWebhook.url}
                  onChange={(e) => setNewWebhook((p) => ({ ...p, url: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} size="sm">
                Add Webhook
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAdding(false);
                  setNewWebhook({ name: '', type: 'slack', url: '' });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Webhook List */}
        {configs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Webhook className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No webhooks configured.</p>
            <p className="text-sm">Add a webhook to receive alerts in Slack or Discord.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {configs.map((webhook) => (
              <div key={webhook.id} className="p-4 rounded-lg border">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded ${WEBHOOK_TYPES[webhook.type].color} text-white`}
                    >
                      {WEBHOOK_TYPES[webhook.type].icon}
                    </div>
                    <div>
                      <div className="font-medium">{webhook.name}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {webhook.url.replace(/\/[^\/]+$/, '/...')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={webhook.enabled ? 'default' : 'secondary'}>
                      {webhook.enabled ? 'Active' : 'Disabled'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTest(webhook.id)}
                      disabled={testingId === webhook.id}
                    >
                      {testingId === webhook.id ? (
                        'Sending...'
                      ) : (
                        <>
                          <Send className="h-3 w-3 mr-1" />
                          Test
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggle(webhook.id)}
                    >
                      {webhook.enabled ? (
                        <X className="h-4 w-4" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(webhook.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Events */}
                <div>
                  <div className="text-sm font-medium mb-2">Events</div>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_EVENTS.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => handleToggleEvent(webhook.id, event.id)}
                        className={`px-3 py-1 rounded-full text-xs transition-colors ${
                          webhook.events.includes(event.id)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {event.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Last Triggered */}
                {webhook.lastTriggered && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    Last triggered: {webhook.lastTriggered}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Help */}
        <div className="p-4 rounded-lg bg-muted text-sm">
          <h4 className="font-medium mb-2">How to set up webhooks</h4>
          <ul className="space-y-1 text-muted-foreground">
            <li>
              <strong>Slack:</strong> Create an incoming webhook at{' '}
              <a href="https://api.slack.com/messaging/webhooks" target="_blank" className="text-primary hover:underline">
                api.slack.com/messaging/webhooks
              </a>
            </li>
            <li>
              <strong>Discord:</strong> Edit channel → Integrations → Webhooks → New Webhook
            </li>
            <li>
              <strong>Custom:</strong> Provide any URL that accepts POST requests with JSON payload
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
