"use client";

import { ToolPage } from "@/components/tools/ToolPage";

export default function TradePlanPage() {
  return (
    <ToolPage
      toolId="get_trade_plan"
      toolName="Trade Plan"
      description="Generate risk-qualified trade plans with entry points, stop losses, and profit targets"
    />
  );
}
