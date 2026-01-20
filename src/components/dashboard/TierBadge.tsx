import { UserTier } from "@/lib/auth/tiers";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TierBadgeProps {
  tier: UserTier;
}

export function TierBadge({ tier }: TierBadgeProps) {
  const colors = {
    free: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
    pro: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    max: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  };

  return (
    <Badge className={cn("uppercase text-xs font-bold", colors[tier])}>
      {tier} Tier
    </Badge>
  );
}
