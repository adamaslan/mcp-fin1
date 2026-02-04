"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
} from "lucide-react";

type ImpactLevel = "high" | "medium" | "low";

interface EconomicEvent {
  id: string;
  date: string;
  time: string;
  event: string;
  country: string;
  impact: ImpactLevel;
  previous?: string;
  forecast?: string;
  actual?: string;
}

// Real data must be fetched from API (TradingEconomics, Forex Factory, etc)
// No mock economic data - show empty state instead
const EMPTY_EVENTS: EconomicEvent[] = [];

const IMPACT_CONFIG: Record<
  ImpactLevel,
  { color: string; bgColor: string; label: string }
> = {
  high: { color: "text-red-500", bgColor: "bg-red-500", label: "High Impact" },
  medium: {
    color: "text-yellow-500",
    bgColor: "bg-yellow-500",
    label: "Medium Impact",
  },
  low: { color: "text-gray-400", bgColor: "bg-gray-400", label: "Low Impact" },
};

export function EconomicCalendar() {
  const [filter, setFilter] = useState<ImpactLevel | "all">("all");

  const filteredEvents =
    filter === "all"
      ? EMPTY_EVENTS
      : EMPTY_EVENTS.filter((e) => e.impact === filter);

  // Group by date
  const groupedEvents = filteredEvents.reduce(
    (acc, event) => {
      if (!acc[event.date]) {
        acc[event.date] = [];
      }
      acc[event.date].push(event);
      return acc;
    },
    {} as Record<string, EconomicEvent[]>,
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Economic Calendar
            </CardTitle>
            <CardDescription>
              Upcoming economic events that may impact markets
            </CardDescription>
          </div>

          {/* Impact Filter */}
          <div className="flex gap-1">
            {(["all", "high", "medium", "low"] as const).map((level) => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  filter === level
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {level === "all"
                  ? "All"
                  : level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedEvents).map(([date, events]) => (
            <div key={date}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                {date}
              </h3>
              <div className="space-y-2">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    {/* Impact indicator */}
                    <div className="flex-shrink-0 pt-1">
                      <div
                        className={`w-2 h-2 rounded-full ${IMPACT_CONFIG[event.impact].bgColor}`}
                        title={IMPACT_CONFIG[event.impact].label}
                      />
                    </div>

                    {/* Event details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{event.event}</span>
                        <Badge variant="outline" className="text-xs">
                          {event.country}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{event.time}</span>
                      </div>
                    </div>

                    {/* Values */}
                    {(event.previous || event.forecast) && (
                      <div className="flex gap-4 text-sm">
                        {event.previous && (
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">
                              Previous
                            </div>
                            <div className="font-medium">{event.previous}</div>
                          </div>
                        )}
                        {event.forecast && (
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">
                              Forecast
                            </div>
                            <div className="font-medium">{event.forecast}</div>
                          </div>
                        )}
                        {event.actual && (
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">
                              Actual
                            </div>
                            <div className="font-medium text-primary">
                              {event.actual}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Warning */}
        <div className="mt-6 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              High-impact events can cause significant market volatility.
              Consider reducing position sizes or closing trades before major
              announcements.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
