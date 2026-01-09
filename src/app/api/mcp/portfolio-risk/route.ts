import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getMCPClient } from '@/lib/mcp/client';
import { TIER_LIMITS } from '@/lib/auth/tiers';

export async function POST(request: Request) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tier = (sessionClaims?.metadata?.tier as string) || 'free';

    // Check if user has access to portfolio risk (Pro+)
    if (tier === 'free') {
      return NextResponse.json(
        { error: 'Portfolio risk is only available in Pro tier and above' },
        { status: 403 }
      );
    }

    const { positions } = await request.json();

    if (!positions || !Array.isArray(positions)) {
      return NextResponse.json(
        { error: 'Positions array is required' },
        { status: 400 }
      );
    }

    // Call MCP server
    const mcp = getMCPClient();
    const result = await mcp.portfolioRisk(positions);

    // Filter hedge suggestions for tier
    let filteredResult = { ...result };
    if (tier === 'pro') {
      // Pro tier doesn't see hedge suggestions
      filteredResult.hedge_suggestions = [];
    }
    // Max tier sees everything

    return NextResponse.json({
      ...filteredResult,
      tierLimit: TIER_LIMITS[tier as any],
    });
  } catch (error) {
    console.error('Portfolio risk API error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate portfolio risk' },
      { status: 500 }
    );
  }
}
