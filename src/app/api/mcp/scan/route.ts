import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getMCPClient } from '@/lib/mcp/client';
import { canAccessUniverse, TIER_LIMITS, type UserTier } from '@/lib/auth/tiers';

export async function POST(request: Request) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tier = (((sessionClaims?.publicMetadata as any)?.tier as string) || 'free') as UserTier;
    const { universe = 'sp500', maxResults = 10 } = await request.json();

    // Check if user can access this universe
    if (!canAccessUniverse(tier as any, universe)) {
      return NextResponse.json(
        { error: `${universe} universe not available in ${tier} tier` },
        { status: 403 }
      );
    }

    const tierLimits = TIER_LIMITS[tier];
    const resultsLimit = tierLimits.scanResultsLimit;

    // Call MCP server
    const mcp = getMCPClient();
    const result = await mcp.scanTrades(universe, Math.min(maxResults, resultsLimit));

    // Limit results based on tier
    const limitedTrades = result.qualified_trades?.slice(0, resultsLimit) || [];

    return NextResponse.json({
      ...result,
      qualified_trades: limitedTrades,
      tierLimit: tierLimits,
      resultsLimited: result.qualified_trades?.length > resultsLimit,
    });
  } catch (error) {
    console.error('Scan API error:', error);
    return NextResponse.json(
      { error: 'Failed to scan trades' },
      { status: 500 }
    );
  }
}
