'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTier } from '@/hooks/useTier';
import { ThemeToggle } from '@/components/dashboard/ThemeToggle';

export default function SettingsPage() {
  const { tier } = useTier();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </div>

      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how MCP Finance looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-muted-foreground">Toggle light/dark theme</p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium">Current Tier</p>
            <p className="text-2xl font-bold mt-1 capitalize">{tier}</p>
          </div>
          <Button variant="outline">View Profile</Button>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize your trading preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium">Default Timeframe</p>
            <p className="text-sm text-muted-foreground">Coming soon</p>
          </div>
          <div>
            <p className="font-medium">Default Universe</p>
            <p className="text-sm text-muted-foreground">Coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
