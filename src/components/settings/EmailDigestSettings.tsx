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
import { Switch } from "@/components/ui/switch";
import {
  Mail,
  Clock,
  Calendar,
  TrendingUp,
  AlertCircle,
  Newspaper,
  BarChart3,
  Check,
} from "lucide-react";

interface DigestSettings {
  enabled: boolean;
  email: string;
  frequency: "daily" | "weekly";
  time: string;
  weekday?: number;
  sections: {
    marketOverview: boolean;
    watchlistSummary: boolean;
    alertsTriggered: boolean;
    topMovers: boolean;
    earningsReminders: boolean;
    newsHighlights: boolean;
  };
}

const DEFAULT_SETTINGS: DigestSettings = {
  enabled: true,
  email: "",
  frequency: "daily",
  time: "07:00",
  weekday: 1,
  sections: {
    marketOverview: true,
    watchlistSummary: true,
    alertsTriggered: true,
    topMovers: true,
    earningsReminders: true,
    newsHighlights: false,
  },
};

const SECTIONS = [
  {
    key: "marketOverview",
    label: "Market Overview",
    description: "S&P 500, NASDAQ, VIX performance",
    icon: BarChart3,
  },
  {
    key: "watchlistSummary",
    label: "Watchlist Summary",
    description: "Price changes for your tracked symbols",
    icon: TrendingUp,
  },
  {
    key: "alertsTriggered",
    label: "Alerts Triggered",
    description: "Summary of alerts that triggered",
    icon: AlertCircle,
  },
  {
    key: "topMovers",
    label: "Top Movers",
    description: "Biggest gainers and losers",
    icon: TrendingUp,
  },
  {
    key: "earningsReminders",
    label: "Earnings Reminders",
    description: "Upcoming earnings for your watchlist",
    icon: Calendar,
  },
  {
    key: "newsHighlights",
    label: "News Highlights",
    description: "Top market news stories",
    icon: Newspaper,
  },
] as const;

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function EmailDigestSettings() {
  const [settings, setSettings] = useState<DigestSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleToggleSection = (key: keyof DigestSettings["sections"]) => {
    setSettings((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [key]: !prev.sections[key],
      },
    }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Digest
            </CardTitle>
            <CardDescription>
              Receive a summary of your portfolio and market activity
            </CardDescription>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(enabled) =>
              setSettings((prev) => ({ ...prev, enabled }))
            }
          />
        </div>
      </CardHeader>
      <CardContent
        className={`space-y-6 ${!settings.enabled ? "opacity-50 pointer-events-none" : ""}`}
      >
        {/* Email Address */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Email Address
          </label>
          <Input
            type="email"
            placeholder="your@email.com"
            value={settings.email}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, email: e.target.value }))
            }
          />
        </div>

        {/* Frequency */}
        <div>
          <label className="text-sm font-medium mb-2 block">Frequency</label>
          <div className="flex gap-3">
            <button
              onClick={() =>
                setSettings((prev) => ({ ...prev, frequency: "daily" }))
              }
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                settings.frequency === "daily"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-muted hover:border-primary/50"
              }`}
            >
              <Clock className="h-4 w-4" />
              Daily
            </button>
            <button
              onClick={() =>
                setSettings((prev) => ({ ...prev, frequency: "weekly" }))
              }
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                settings.frequency === "weekly"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-muted hover:border-primary/50"
              }`}
            >
              <Calendar className="h-4 w-4" />
              Weekly
            </button>
          </div>
        </div>

        {/* Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Delivery Time
            </label>
            <Input
              type="time"
              value={settings.time}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, time: e.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Time is in your local timezone
            </p>
          </div>

          {settings.frequency === "weekly" && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Delivery Day
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
                value={settings.weekday}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    weekday: parseInt(e.target.value),
                  }))
                }
              >
                {WEEKDAYS.map((day, index) => (
                  <option key={day} value={index}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Sections */}
        <div>
          <label className="text-sm font-medium mb-3 block">
            Include in Digest
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isEnabled =
                settings.sections[
                  section.key as keyof DigestSettings["sections"]
                ];

              return (
                <button
                  key={section.key}
                  onClick={() =>
                    handleToggleSection(
                      section.key as keyof DigestSettings["sections"],
                    )
                  }
                  className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${
                    isEnabled
                      ? "border-primary/50 bg-primary/5"
                      : "border-muted hover:border-muted-foreground/30"
                  }`}
                >
                  <div
                    className={`mt-0.5 p-1.5 rounded ${
                      isEnabled
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{section.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {section.description}
                    </div>
                  </div>
                  {isEnabled && (
                    <Check className="h-4 w-4 text-primary mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 rounded-lg bg-muted/50 border">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Digest Preview
          </h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <strong>Schedule:</strong>{" "}
              {settings.frequency === "daily"
                ? `Every day at ${settings.time}`
                : `Every ${WEEKDAYS[settings.weekday ?? 1]} at ${settings.time}`}
            </p>
            <p>
              <strong>Sections:</strong>{" "}
              {Object.entries(settings.sections)
                .filter(([, enabled]) => enabled)
                .map(([key]) => SECTIONS.find((s) => s.key === key)?.label)
                .join(", ") || "None selected"}
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving || !settings.email}>
            {saving ? "Saving..." : saved ? "Saved!" : "Save Settings"}
          </Button>
          {saved && (
            <Badge
              variant="outline"
              className="text-green-500 border-green-500"
            >
              <Check className="h-3 w-3 mr-1" />
              Settings saved
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
