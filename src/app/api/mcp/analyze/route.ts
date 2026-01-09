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
    const { symbol, period = '1mo', useAi = false } = await request.json();

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    // Call MCP server
    const mcp = getMCPClient();
    const result = await mcp.analyzeSecurity(symbol, period, useAi);

    // Filter signals based on tier
    let filteredSignals = result.signals || [];
    if (tier === 'free') {
      // Free users see only top 3 signals
      filteredSignals = filteredSignals.slice(0, 3);
    } else if (tier === 'pro') {
      // Pro users see top 10 signals
      filteredSignals = filteredSignals.slice(0, 10);
    }
    // Max users see all signals (no filtering)

    return NextResponse.json({
      ...result,
      signals: filteredSignals,
      tierLimit: TIER_LIMITS[tier as any],
    });
  } catch (error) {
    console.error('Analyze API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze security' },
      { status: 500 }
    );
  }
}
