'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PriceTargetAlerts } from '@/components/alerts/PriceTargetAlerts';
import { VolumeSpikeAlerts } from '@/components/alerts/VolumeSpikeAlerts';
import { WebhookSettings } from '@/components/alerts/WebhookSettings';
import { Target, Activity, Webhook } from 'lucide-react';

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState('price');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Alerts</h1>
        <p className="text-muted-foreground">
          Configure price targets, volume alerts, and notification integrations.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="price" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Price Targets
          </TabsTrigger>
          <TabsTrigger value="volume" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Volume Spikes
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="price">
          <PriceTargetAlerts />
        </TabsContent>

        <TabsContent value="volume">
          <VolumeSpikeAlerts />
        </TabsContent>

        <TabsContent value="webhooks">
          <WebhookSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
