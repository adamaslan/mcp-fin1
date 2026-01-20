"use client";

import { useTier } from "@/hooks/useTier";
import { canAccessFeature, TIER_LIMITS } from "@/lib/auth/tiers";
import { BlurredContent } from "./BlurredContent";
import { UpgradeCTA } from "./UpgradeCTA";

interface TierGateProps {
  feature: string;
  requiredTier?: "pro" | "max";
  children: React.ReactNode;
  fallback?: React.ReactNode;
  blurContent?: boolean;
}

export function TierGate({
  feature,
  requiredTier,
  children,
  fallback,
  blurContent = true,
}: TierGateProps) {
  const { tier, loading } = useTier();

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  const hasAccess = canAccessFeature(tier, feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (blurContent) {
    return (
      <BlurredContent>
        {children}
        <UpgradeCTA
          currentTier={tier}
          requiredTier={requiredTier || "pro"}
          feature={feature}
        />
      </BlurredContent>
    );
  }

  return (
    <UpgradeCTA
      currentTier={tier}
      requiredTier={requiredTier || "pro"}
      feature={feature}
    />
  );
}
