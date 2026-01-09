import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getMCPClient } from '@/lib/mcp/client';
import { canAccessTimeframe, TIER_LIMITS, type UserTier } from '@/lib/auth/tiers';

export async function POST(request: Request) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tier = (((sessionClaims?.publicMetadata as any)?.tier as string) || 'free') as UserTier;
    const { symbol, period = '1mo' } = await request.json();

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    // Call MCP server
    const mcp = getMCPClient();
    const result = await mcp.getTradePlan(symbol, period);

    // Filter trade plans based on timeframe access
    let filteredPlans = result.trade_plans || [];
    if (tier === 'free') {
      // Free users only see swing trades
      filteredPlans = filteredPlans.filter((p) => p.timeframe === 'swing');
    } else if (tier === 'pro') {
      // Pro users see swing, day, and scalp
      filteredPlans = filteredPlans.filter((p) =>
        canAccessTimeframe(tier as any, p.timeframe)
      );
    }
    // Max users see all timeframes (no filtering)

    return NextResponse.json({
      ...result,
      trade_plans: filteredPlans,
      has_trades: filteredPlans.length > 0,
      tierLimit: TIER_LIMITS[tier],
    });
  } catch (error) {
    console.error('Trade plan API error:', error);
    return NextResponse.json(
      { error: 'Failed to get trade plan' },
      { status: 500 }
    );
  }
}
