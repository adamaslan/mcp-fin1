"use client";

import { useUser } from "@clerk/nextjs";
import { UserTier } from "@/lib/auth/tiers";

export function useTier(): { tier: UserTier; loading: boolean } {
  const { user, isLoaded } = useUser();

  const tier = ((user?.publicMetadata?.tier as UserTier) || "free") as UserTier;

  return {
    tier,
    loading: !isLoaded,
  };
}
