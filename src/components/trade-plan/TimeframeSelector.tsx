"use client";

import { useTier } from "@/hooks/useTier";
import { canAccessTimeframe, TIER_LIMITS } from "@/lib/auth/tiers";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimeframeSelectorProps {
  value: "swing" | "day" | "scalp";
  onChange: (timeframe: "swing" | "day" | "scalp") => void;
}

export function TimeframeSelector({ value, onChange }: TimeframeSelectorProps) {
  const { tier } = useTier();
  const tierLimits = TIER_LIMITS[tier];

  const timeframes = [
    { value: "swing" as const, label: "Swing (2-10 days)", available: true },
    {
      value: "day" as const,
      label: "Day (Intraday)",
      available: canAccessTimeframe(tier, "day"),
    },
    {
      value: "scalp" as const,
      label: "Scalp (Minutes)",
      available: canAccessTimeframe(tier, "scalp"),
    },
  ];

  return (
    <div className="flex gap-2">
      {timeframes.map((tf) => (
        <Button
          key={tf.value}
          variant={value === tf.value ? "default" : "outline"}
          onClick={() => tf.available && onChange(tf.value)}
          disabled={!tf.available}
          className={cn(
            "relative",
            !tf.available && "opacity-50 cursor-not-allowed",
          )}
          title={!tf.available ? `Available in Pro+ tier` : ""}
        >
          {tf.label}
          {!tf.available && (
            <span className="absolute -top-2 -right-2 text-xs bg-primary text-primary-foreground px-1 rounded">
              Pro+
            </span>
          )}
        </Button>
      ))}
    </div>
  );
}
