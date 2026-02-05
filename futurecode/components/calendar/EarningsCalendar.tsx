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
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Bell,
  ExternalLink,
} from "lucide-react";

interface EarningsEvent {
  id: string;
  symbol: string;
  company: string;
  date: string;
  time: "BMO" | "AMC" | "TBD"; // Before Market Open, After Market Close
  epsEstimate?: string;
  epsPrior?: string;
  revenueEstimate?: string;
  revenuePrior?: string;
  inWatchlist?: boolean;
}

// Real data must be fetched from earnings API
// No mock earnings data - show empty state instead
const EMPTY_EARNINGS: EarningsEvent[] = [];

const TIME_LABELS = {
  BMO: { label: "Before Open", color: "bg-blue-500" },
  AMC: { label: "After Close", color: "bg-purple-500" },
  TBD: { label: "TBD", color: "bg-gray-500" },
};

interface EarningsCalendarProps {
  showWatchlistOnly?: boolean;
}

export function EarningsCalendar({
  showWatchlistOnly = false,
}: EarningsCalendarProps) {
  const [watchlistFilter, setWatchlistFilter] = useState(showWatchlistOnly);

  const filteredEarnings = watchlistFilter
    ? EMPTY_EARNINGS.filter((e) => e.inWatchlist)
    : EMPTY_EARNINGS;

  // Group by date
  const groupedEarnings = filteredEarnings.reduce(
    (acc, event) => {
      if (!acc[event.date]) {
        acc[event.date] = [];
      }
      acc[event.date].push(event);
      return acc;
    },
    {} as Record<string, EarningsEvent[]>,
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Earnings Calendar
            </CardTitle>
            <CardDescription>
              Upcoming earnings reports this week
            </CardDescription>
          </div>

          <Button
            variant={watchlistFilter ? "default" : "outline"}
            size="sm"
            onClick={() => setWatchlistFilter(!watchlistFilter)}
          >
            <Bell className="h-4 w-4 mr-1" />
            Watchlist Only
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedEarnings).map(([date, events]) => (
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
                    {/* Symbol */}
                    <div className="flex-shrink-0">
                      <a
                        href={`/analyze/${event.symbol}`}
                        className="block font-bold text-lg hover:text-primary transition-colors"
                      >
                        {event.symbol}
                      </a>
                      <Badge
                        variant="secondary"
                        className={`text-xs text-white ${TIME_LABELS[event.time].color}`}
                      >
                        {TIME_LABELS[event.time].label}
                      </Badge>
                    </div>

                    {/* Company */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground truncate">
                        {event.company}
                      </p>
                      {event.inWatchlist && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-primary">
                          <Bell className="h-3 w-3" />
                          In watchlist
                        </div>
                      )}
                    </div>

                    {/* Estimates */}
                    <div className="flex gap-6 text-sm">
                      {event.epsEstimate && (
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">
                            EPS Est.
                          </div>
                          <div className="font-medium">{event.epsEstimate}</div>
                          {event.epsPrior && (
                            <div className="text-xs text-muted-foreground">
                              Prior: {event.epsPrior}
                            </div>
                          )}
                        </div>
                      )}
                      {event.revenueEstimate && (
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">
                            Rev Est.
                          </div>
                          <div className="font-medium">
                            {event.revenueEstimate}
                          </div>
                          {event.revenuePrior && (
                            <div className="text-xs text-muted-foreground">
                              Prior: {event.revenuePrior}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/analyze/${event.symbol}`}>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {Object.keys(groupedEarnings).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {watchlistFilter
                ? "No earnings from your watchlist this week."
                : "No earnings scheduled for this period."}
            </div>
          )}
        </div>

        {/* Pro tip */}
        <div className="mt-6 p-3 rounded-lg bg-muted">
          <p className="text-xs text-muted-foreground">
            <strong>Pro tip:</strong> Avoid holding positions through earnings
            unless you have a specific thesis. Implied volatility is typically
            elevated, and moves can be unpredictable regardless of results.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
