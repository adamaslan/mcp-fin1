import { db } from "./client";
import {
  users,
  watchlists,
  positions,
  tradeJournal,
  usageTracking,
  alerts,
} from "./schema";
import { eq, and, gte } from "drizzle-orm";

// Users
export async function getOrCreateUser(
  userId: string,
  email: string,
  tier: string = "free",
) {
  const existing = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (existing) {
    return existing;
  }

  const newUser = await db.insert(users).values({
    id: userId,
    email,
    tier,
  });

  return { id: userId, email, tier };
}

export async function updateUserTier(
  userId: string,
  newTier: string,
  updatedBy: string,
) {
  return db
    .update(users)
    .set({
      tier: newTier,
      tierUpdatedAt: new Date(),
      tierUpdatedBy: updatedBy,
    })
    .where(eq(users.id, userId));
}

// Usage Tracking
export async function getTodayUsage(userId: string) {
  const today = new Date().toISOString().split("T")[0];

  const existing = await db.query.usageTracking.findFirst({
    where: and(eq(usageTracking.userId, userId), eq(usageTracking.date, today)),
  });

  if (!existing) {
    await db.insert(usageTracking).values({
      id: `usage_${userId}_${today}`,
      userId,
      date: today,
      analysisCount: 0,
      scanCount: 0,
    });
    return { analysisCount: 0, scanCount: 0 };
  }

  return {
    analysisCount: existing.analysisCount || 0,
    scanCount: existing.scanCount || 0,
  };
}

export async function incrementAnalysisCount(userId: string) {
  const today = new Date().toISOString().split("T")[0];
  const usage = await getTodayUsage(userId);

  await db
    .update(usageTracking)
    .set({ analysisCount: (usage.analysisCount || 0) + 1 })
    .where(
      and(eq(usageTracking.userId, userId), eq(usageTracking.date, today)),
    );
}

/**
 * Increment analysis count and return the new count in a single DB operation
 * More efficient than separate increment + getTodayUsage calls
 */
export async function incrementAnalysisCountAndGet(
  userId: string,
): Promise<number> {
  const today = new Date().toISOString().split("T")[0];

  // Ensure usage record exists
  const existing = await db.query.usageTracking.findFirst({
    where: and(eq(usageTracking.userId, userId), eq(usageTracking.date, today)),
  });

  if (!existing) {
    const created = await db
      .insert(usageTracking)
      .values({
        id: `usage_${userId}_${today}`,
        userId,
        date: today,
        analysisCount: 1,
        scanCount: 0,
      })
      .returning();
    return created[0].analysisCount;
  }

  // Update and return new count
  const updated = await db
    .update(usageTracking)
    .set({ analysisCount: (existing.analysisCount || 0) + 1 })
    .where(and(eq(usageTracking.userId, userId), eq(usageTracking.date, today)))
    .returning();

  return updated[0].analysisCount;
}

export async function incrementScanCount(userId: string) {
  const today = new Date().toISOString().split("T")[0];
  const usage = await getTodayUsage(userId);

  await db
    .update(usageTracking)
    .set({ scanCount: (usage.scanCount || 0) + 1 })
    .where(
      and(eq(usageTracking.userId, userId), eq(usageTracking.date, today)),
    );
}

/**
 * Increment scan count and return the new count in a single DB operation
 * More efficient than separate increment + getTodayUsage calls
 */
export async function incrementScanCountAndGet(
  userId: string,
): Promise<number> {
  const today = new Date().toISOString().split("T")[0];

  // Ensure usage record exists
  const existing = await db.query.usageTracking.findFirst({
    where: and(eq(usageTracking.userId, userId), eq(usageTracking.date, today)),
  });

  if (!existing) {
    const created = await db
      .insert(usageTracking)
      .values({
        id: `usage_${userId}_${today}`,
        userId,
        date: today,
        analysisCount: 0,
        scanCount: 1,
      })
      .returning();
    return created[0].scanCount;
  }

  // Update and return new count
  const updated = await db
    .update(usageTracking)
    .set({ scanCount: (existing.scanCount || 0) + 1 })
    .where(and(eq(usageTracking.userId, userId), eq(usageTracking.date, today)))
    .returning();

  return updated[0].scanCount;
}

// Watchlists
export async function getWatchlists(userId: string) {
  return db.query.watchlists.findMany({
    where: eq(watchlists.userId, userId),
  });
}

export async function createWatchlist(
  userId: string,
  name: string,
  symbols: string[] = [],
) {
  return db.insert(watchlists).values({
    id: `watchlist_${Date.now()}`,
    userId,
    name,
    symbols,
  });
}

export async function updateWatchlist(
  watchlistId: string,
  name?: string,
  symbols?: string[],
) {
  const updates: { name?: string; symbols?: string[] } = {};
  if (name) updates.name = name;
  if (symbols) updates.symbols = symbols;

  if (Object.keys(updates).length === 0) return;

  return db
    .update(watchlists)
    .set(updates)
    .where(eq(watchlists.id, watchlistId));
}

export async function deleteWatchlist(watchlistId: string) {
  return db.delete(watchlists).where(eq(watchlists.id, watchlistId));
}

// Positions
export async function getPositions(userId: string) {
  return db.query.positions.findMany({
    where: and(eq(positions.userId, userId), eq(positions.status, "open")),
  });
}

export async function createPosition(
  userId: string,
  symbol: string,
  shares: number,
  entryPrice: number,
  entryDate: Date,
  notes?: string,
) {
  return db.insert(positions).values({
    id: `position_${Date.now()}`,
    userId,
    symbol,
    shares,
    entryPrice,
    entryDate,
    notes,
  });
}

export async function updatePosition(
  positionId: string,
  shares?: number,
  entryPrice?: number,
  notes?: string,
) {
  const updates: { shares?: number; entryPrice?: number; notes?: string } = {};
  if (shares !== undefined) updates.shares = shares;
  if (entryPrice !== undefined) updates.entryPrice = entryPrice;
  if (notes !== undefined) updates.notes = notes;

  if (Object.keys(updates).length === 0) return;

  return db.update(positions).set(updates).where(eq(positions.id, positionId));
}

export async function closePosition(positionId: string) {
  return db
    .update(positions)
    .set({ status: "closed" })
    .where(eq(positions.id, positionId));
}

// Trade Journal
export async function getTradeJournal(userId: string) {
  return db.query.tradeJournal.findMany({
    where: eq(tradeJournal.userId, userId),
  });
}

export async function createTradeEntry(
  userId: string,
  symbol: string,
  entryPrice: number,
  shares: number,
  entryDate: Date,
  notes?: string,
  tradePlanSnapshot?: Record<string, unknown>,
) {
  return db.insert(tradeJournal).values({
    id: `trade_${Date.now()}`,
    userId,
    symbol,
    entryPrice,
    shares,
    entryDate,
    notes,
    tradePlanSnapshot,
  });
}

export async function closeTradeEntry(
  tradeId: string,
  exitPrice: number,
  exitDate: Date,
) {
  const entry = await db.query.tradeJournal.findFirst({
    where: eq(tradeJournal.id, tradeId),
  });

  if (!entry) return;

  const pnl = (exitPrice - entry.entryPrice) * entry.shares;
  const pnlPercent = ((exitPrice - entry.entryPrice) / entry.entryPrice) * 100;

  return db
    .update(tradeJournal)
    .set({
      exitPrice,
      exitDate,
      pnl,
      pnlPercent,
    })
    .where(eq(tradeJournal.id, tradeId));
}

// Alerts (Max tier only)
export async function getAlerts(userId: string) {
  return db.query.alerts.findMany({
    where: eq(alerts.userId, userId),
  });
}

export async function createAlert(
  userId: string,
  symbol: string,
  alertType: string,
  condition: Record<string, unknown>,
) {
  return db.insert(alerts).values({
    id: `alert_${Date.now()}`,
    userId,
    symbol,
    alertType,
    condition,
  });
}

export async function updateAlert(
  alertId: string,
  isActive: boolean,
  lastTriggered?: Date,
) {
  const updates: { isActive: boolean; lastTriggered?: Date } = { isActive };
  if (lastTriggered) updates.lastTriggered = lastTriggered;

  return db.update(alerts).set(updates).where(eq(alerts.id, alertId));
}

export async function deleteAlert(alertId: string) {
  return db.delete(alerts).where(eq(alerts.id, alertId));
}
