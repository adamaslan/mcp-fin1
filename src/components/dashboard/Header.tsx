"use client";

import { useTier } from "@/hooks/useTier";
import { ThemeToggle } from "./ThemeToggle";
import { TierBadge } from "./TierBadge";

export function Header() {
  const { tier } = useTier();

  return (
    <div className="flex items-center justify-between w-full">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="flex items-center gap-4">
        <TierBadge tier={tier} />
        <ThemeToggle />
      </div>
    </div>
  );
}
