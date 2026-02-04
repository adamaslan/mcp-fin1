"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import type { EconomicEvent } from "@/lib/mcp/types";

interface EconomicEventsCardProps {
  events: EconomicEvent[];
}

export function EconomicEventsCard({ events }: EconomicEventsCardProps) {
  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "HIGH":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      case "MEDIUM":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "LOW":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
      default:
        return "";
    }
  };

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case "HIGH":
        return <AlertTriangle className="h-4 w-4" />;
      case "MEDIUM":
        return <AlertCircle className="h-4 w-4" />;
      case "LOW":
        return <Info className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return (
    <Card data-testid="economic-events-card">
      <CardHeader>
        <CardTitle>Economic Events</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedEvents.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No major economic events scheduled
          </p>
        ) : (
          <div className="space-y-3">
            {sortedEvents.map((event, index) => (
              <div
                key={index}
                data-testid="economic-event"
                className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {new Date(event.timestamp).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "America/New_York",
                      })}{" "}
                      ET
                    </span>
                    <Badge className={getImportanceColor(event.importance)}>
                      <span className="mr-1">
                        {getImportanceIcon(event.importance)}
                      </span>
                      {event.importance}
                    </Badge>
                  </div>
                </div>

                <div className="mb-2">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {event.event_name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Forecast:
                    </span>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {event.forecast}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Previous:
                    </span>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {event.previous}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
