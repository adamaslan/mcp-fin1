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
  DollarSign,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
  Wallet,
} from "lucide-react";

interface DividendRecord {
  id: string;
  symbol: string;
  company: string;
  exDate: string;
  payDate: string;
  amount: number;
  yield: number;
  frequency: "monthly" | "quarterly" | "annual";
  shares: number;
  totalPayout: number;
  status: "upcoming" | "paid" | "ex-date-passed";
}

interface DividendSummary {
  totalAnnual: number;
  totalYTD: number;
  nextMonthProjected: number;
  avgYield: number;
}

// Real dividend data must come from portfolio API
// No mock dividend data
const EMPTY_DIVIDENDS: DividendRecord[] = [];

const EMPTY_SUMMARY: DividendSummary = {
  totalAnnual: 0,
  totalYTD: 0,
  nextMonthProjected: 0,
  avgYield: 0,
};

const FREQUENCY_LABELS = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Annual",
};

const STATUS_STYLES = {
  upcoming: {
    label: "Upcoming",
    className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  "ex-date-passed": {
    label: "Ex-Date Passed",
    className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  },
  paid: {
    label: "Paid",
    className: "bg-green-500/10 text-green-500 border-green-500/20",
  },
};

interface DividendTrackerProps {
  dividends?: DividendRecord[];
  summary?: DividendSummary;
}

export function DividendTracker({
  dividends = EMPTY_DIVIDENDS,
  summary = EMPTY_SUMMARY,
}: DividendTrackerProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "upcoming" | "paid">("all");

  const filteredDividends = dividends.filter((d) => {
    if (filter === "all") return true;
    if (filter === "upcoming")
      return d.status === "upcoming" || d.status === "ex-date-passed";
    return d.status === "paid";
  });

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Dividend Tracker
            </CardTitle>
            <CardDescription>
              Track dividend income from your portfolio holdings
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground mb-1">
              Annual Income
            </div>
            <div className="text-2xl font-bold text-green-500">
              ${summary.totalAnnual.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">projected</div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground mb-1">YTD Income</div>
            <div className="text-2xl font-bold">
              ${summary.totalYTD.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">received</div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground mb-1">Next Month</div>
            <div className="text-2xl font-bold">
              ${summary.nextMonthProjected.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">expected</div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground mb-1">Avg Yield</div>
            <div className="text-2xl font-bold">
              {summary.avgYield.toFixed(2)}%
            </div>
            <div className="text-xs text-muted-foreground">weighted</div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "upcoming" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("upcoming")}
          >
            Upcoming
          </Button>
          <Button
            variant={filter === "paid" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("paid")}
          >
            Paid
          </Button>
        </div>

        {/* Dividend List */}
        <div className="space-y-3">
          {filteredDividends.map((dividend) => {
            const isExpanded = expanded === dividend.id;
            const statusStyle = STATUS_STYLES[dividend.status];

            return (
              <div
                key={dividend.id}
                className="border rounded-lg overflow-hidden"
              >
                {/* Main Row */}
                <button
                  onClick={() => toggleExpand(dividend.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-left">
                      <div className="font-bold">{dividend.symbol}</div>
                      <div className="text-xs text-muted-foreground">
                        {dividend.company}
                      </div>
                    </div>
                    <Badge variant="outline" className={statusStyle.className}>
                      {statusStyle.label}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="font-semibold text-green-500">
                        ${dividend.totalPayout.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {dividend.shares} shares × ${dividend.amount}
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t bg-muted/30">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          Ex-Dividend Date
                        </div>
                        <div className="font-medium flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(dividend.exDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          Payment Date
                        </div>
                        <div className="font-medium flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {new Date(dividend.payDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          Dividend Yield
                        </div>
                        <div className="font-medium flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {dividend.yield.toFixed(2)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          Frequency
                        </div>
                        <div className="font-medium">
                          {FREQUENCY_LABELS[dividend.frequency]}
                        </div>
                      </div>
                    </div>

                    {/* Annual Projection */}
                    <div className="mt-4 p-3 rounded bg-muted/50">
                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          Annual projection:{" "}
                        </span>
                        <span className="font-semibold text-green-500">
                          $
                          {(
                            dividend.totalPayout *
                            (dividend.frequency === "monthly"
                              ? 12
                              : dividend.frequency === "quarterly"
                                ? 4
                                : 1)
                          ).toFixed(2)}
                        </span>
                        <span className="text-muted-foreground">
                          {" "}
                          (
                          {dividend.frequency === "monthly"
                            ? "12"
                            : dividend.frequency === "quarterly"
                              ? "4"
                              : "1"}{" "}
                          payments)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredDividends.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Wallet className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No dividends found for this filter.</p>
          </div>
        )}

        {/* Income Chart Placeholder */}
        <div className="p-4 rounded-lg border border-dashed">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Monthly Dividend Income
          </h4>
          <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
            Chart visualization coming soon
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
