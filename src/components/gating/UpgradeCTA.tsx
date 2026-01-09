'use client';

import { UserTier } from '@/lib/auth/tiers';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

interface UpgradeCTAProps {
  currentTier: UserTier;
  requiredTier: 'pro' | 'max';
  feature: string;
}

export function UpgradeCTA({ currentTier, requiredTier, feature }: UpgradeCTAProps) {
  const messages = {
    free: {
      pro: `Upgrade to Pro to unlock ${feature}`,
      max: `Upgrade to Max to unlock ${feature}`,
    },
    pro: {
      pro: `${feature} is not available in your plan`,
      max: `Upgrade to Max to unlock ${feature}`,
    },
    max: {
      pro: `${feature} is not available`,
      max: `${feature} is not available`,
    },
  };

  const message = messages[currentTier][requiredTier];

  return (
    <div className="flex flex-col items-center gap-3">
      <Lock className="h-6 w-6 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button
        asChild
        variant="default"
        size="sm"
      >
        <a href="/pricing">View Plans</a>
      </Button>
    </div>
  );
}
