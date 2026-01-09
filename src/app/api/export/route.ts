import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db/client';
import { tradeJournal, positions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { sessionClaims } = await auth();
  const tier = (sessionClaims?.publicMetadata as any)?.tier || 'free';

  if (tier !== 'max') {
    return Response.json({ error: 'Feature available for Max tier only' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    const trades = await db.query.tradeJournal.findMany({
      where: eq(tradeJournal.user_id, userId),
      orderBy: (tradeJournal, { desc }) => desc(tradeJournal.entry_date),
    });

    const userPositions = await db.query.positions.findMany({
      where: eq(positions.user_id, userId),
    });

    if (format === 'csv') {
      return generateCSV(trades, userPositions);
    } else {
      return generateJSON(trades, userPositions);
    }
  } catch (error) {
    console.error('Failed to export data:', error);
    return Response.json({ error: 'Failed to export data' }, { status: 500 });
  }
}

function generateCSV(trades: any[], positions: any[]) {
  let csv = 'Trade Journal\n';
  csv += 'Symbol,Entry Price,Exit Price,Shares,Entry Date,Exit Date,P&L,P&L %,Status,Notes\n';

  trades.forEach((trade) => {
    csv += `${trade.symbol},${trade.entry_price},${trade.exit_price || ''},${trade.shares},${trade.entry_date},${trade.exit_date || ''},${trade.pnl || ''},${trade.pnl_percent || ''},${trade.status},"${(trade.notes || '').replace(/"/g, '""')}"\n`;
  });

  csv += '\n\nPortfolio Positions\n';
  csv += 'Symbol,Shares,Entry Price,Current Value\n';

  positions.forEach((pos) => {
    csv += `${pos.symbol},${pos.shares},${pos.entry_price},${pos.current_value || ''}\n`;
  });

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="trade-data-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}

function generateJSON(trades: any[], positions: any[]) {
  const data = {
    exportDate: new Date().toISOString(),
    summary: {
      totalTrades: trades.length,
      closedTrades: trades.filter((t) => t.status === 'closed').length,
      openTrades: trades.filter((t) => t.status === 'open').length,
      totalPnL: trades.reduce((sum, t) => sum + (t.pnl || 0), 0),
      winRate:
        trades.filter((t) => t.status === 'closed').length > 0
          ? (trades.filter((t) => t.status === 'closed' && (t.pnl || 0) > 0).length /
              trades.filter((t) => t.status === 'closed').length) *
            100
          : 0,
    },
    trades,
    positions,
  };

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="trade-data-${new Date().toISOString().split('T')[0]}.json"`,
    },
  });
}
