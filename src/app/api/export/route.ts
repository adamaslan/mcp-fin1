import { db } from "@/lib/db/client";
import { tradeJournal, positions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { ensureUserInitialized } from "@/lib/auth/user-init";
import type { InferSelectModel } from "drizzle-orm";

type Trade = InferSelectModel<typeof tradeJournal>;
type Position = InferSelectModel<typeof positions>;

export async function GET(request: Request) {
  try {
    const { userId, tier } = await ensureUserInitialized();

    if (tier !== "max") {
      return Response.json(
        { error: "Feature available for Max tier only" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json";

    const trades = await db.query.tradeJournal.findMany({
      where: eq(tradeJournal.userId, userId),
      orderBy: desc(tradeJournal.entryDate),
    });

    const userPositions = await db.query.positions.findMany({
      where: eq(positions.userId, userId),
    });

    if (format === "csv") {
      return generateCSV(trades, userPositions);
    } else {
      return generateJSON(trades, userPositions);
    }
  } catch (error) {
    console.error("Failed to export data:", error);
    return Response.json({ error: "Failed to export data" }, { status: 500 });
  }
}

function generateCSV(trades: Trade[], userPositions: Position[]) {
  let csv = "Trade Journal\n";
  csv +=
    "Symbol,Entry Price,Exit Price,Shares,Entry Date,Exit Date,P&L,P&L %,Status,Notes\n";

  trades.forEach((trade: Trade) => {
    csv += `${trade.symbol},${trade.entry_price},${trade.exit_price || ""},${trade.shares},${trade.entry_date},${trade.exit_date || ""},${trade.pnl || ""},${trade.pnl_percent || ""},${trade.status},"${(trade.notes || "").replace(/"/g, '""')}"\n`;
  });

  csv += "\n\nPortfolio Positions\n";
  csv += "Symbol,Shares,Entry Price,Current Value\n";

  userPositions.forEach((pos: Position) => {
    csv += `${pos.symbol},${pos.shares},${pos.entry_price},${pos.current_value || ""}\n`;
  });

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="trade-data-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}

function generateJSON(trades: Trade[], userPositions: Position[]) {
  const closedTrades = trades.filter((t: Trade) => t.status === "closed");
  const winningClosedTrades = trades.filter(
    (t: Trade) => t.status === "closed" && (t.pnl || 0) > 0,
  );

  const data = {
    exportDate: new Date().toISOString(),
    summary: {
      totalTrades: trades.length,
      closedTrades: closedTrades.length,
      openTrades: trades.filter((t: Trade) => t.status === "open").length,
      totalPnL: trades.reduce((sum: number, t: Trade) => sum + (t.pnl || 0), 0),
      winRate:
        closedTrades.length > 0
          ? (winningClosedTrades.length / closedTrades.length) * 100
          : 0,
    },
    trades,
    positions: userPositions,
  };

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="trade-data-${new Date().toISOString().split("T")[0]}.json"`,
    },
  });
}
