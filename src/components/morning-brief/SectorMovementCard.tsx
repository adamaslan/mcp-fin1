"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { SectorMovement } from "@/lib/mcp/types";

interface SectorMovementCardProps {
  leaders: SectorMovement[];
  losers: SectorMovement[];
}

export function SectorMovementCard({
  leaders,
  losers,
}: SectorMovementCardProps) {
  const renderSectorItem = (
    sector: SectorMovement,
    type: "leader" | "loser",
  ) => {
    const isPositive = type === "leader";
    const barWidth = Math.min(Math.abs(sector.change_percent) * 10, 100);
    const barColor = isPositive ? "bg-green-500" : "bg-red-500";
    const textColor = isPositive
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400";

    return (
      <div key={sector.sector} className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {sector.sector}
          </span>
          <span className={`font-semibold ${textColor}`}>
            {sector.change_percent > 0 ? "+" : ""}
            {sector.change_percent.toFixed(2)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full ${barColor} transition-all`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <Card data-testid="sector-movement-card">
      <CardHeader>
        <CardTitle>Sector Movement</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          {/* Leaders */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              Leaders
            </h3>
            <div data-testid="sector-leaders-card" className="space-y-3">
              {leaders.length === 0 ? (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  No sector leaders
                </p>
              ) : (
                leaders.map((leader) => renderSectorItem(leader, "leader"))
              )}
            </div>
          </div>

          {/* Losers */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              Losers
            </h3>
            <div data-testid="sector-losers-card" className="space-y-3">
              {losers.length === 0 ? (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  No sector losers
                </p>
              ) : (
                losers.map((loser) => renderSectorItem(loser, "loser"))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
