/**
 * Firestore cache for landing page data.
 *
 * Two collections are used (both on the Firestore free tier):
 *
 *  1. demo/market_snapshot  — written after every successful batch of MCP
 *     calls; read as fallback when MCP is unavailable.  A single small
 *     document (~5-10 KB) means reads/writes stay well inside the 50K/20K
 *     daily free-tier limits even with 5-minute ISR revalidation.
 *
 *  2. signals/{auto-id}  — written by the Python MCP backend
 *     (detect_signals.py / rank_signals_ai.py).  We read from it here to
 *     get live signal scores for portfolio symbols without calling MCP at
 *     request time.
 */

import { getDb } from "./admin";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SignalEntry {
  symbol: string;
  score: number; // avg_score from signals collection (0-100)
  bullish: number;
  bearish: number;
  price: number;
  change: number;
}

export interface MarketSnapshot {
  winnerSymbol: string;
  portfolioSymbols: string[];
  comparison: SignalEntry[];
  tradePlan: {
    symbol: string;
    entry_price: number | null;
    stop_price: number | null;
    target_price: number | null;
    risk_reward_ratio: number | null;
    bias: string | null;
    timeframe: string | null;
    risk_quality: string | null;
    primary_signal: string | null;
  } | null;
  sampleAnalysis: {
    symbol: string;
    signals: any[];
    summary: { bullish: number; bearish: number; neutral: number };
    indicators?: any;
    price?: any;
  } | null;
  fibonacci: {
    symbol: string;
    price?: any;
    levels: any[];
    signals: any[];
    clusters: any[];
    summary?: any;
  } | null;
  market: {
    status: string;
    futuresES: number;
    futuresNQ: number;
    vix: number;
    economicEvents: any[];
    sectorLeaders: any[];
    sectorLosers: any[];
    keyThemes: any[];
  } | null;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// market_snapshot helpers
// ---------------------------------------------------------------------------

const SNAPSHOT_PATH = { collection: "demo", doc: "market_snapshot" } as const;

/** Read the last successfully written market snapshot from Firestore. */
export async function readMarketSnapshot(): Promise<MarketSnapshot | null> {
  try {
    const db = getDb();
    const snap = await db
      .collection(SNAPSHOT_PATH.collection)
      .doc(SNAPSHOT_PATH.doc)
      .get();
    if (!snap.exists) return null;
    return snap.data() as MarketSnapshot;
  } catch {
    return null;
  }
}

/** Persist a market snapshot after a successful set of MCP calls. Non-fatal on error. */
export async function writeMarketSnapshot(
  data: Omit<MarketSnapshot, "updatedAt">,
): Promise<void> {
  try {
    const db = getDb();
    await db
      .collection(SNAPSHOT_PATH.collection)
      .doc(SNAPSHOT_PATH.doc)
      .set({ ...data, updatedAt: new Date().toISOString() });
  } catch {
    // Cache write failure is non-fatal — the response has already been built.
  }
}

// ---------------------------------------------------------------------------
// signals collection helpers
// ---------------------------------------------------------------------------

/**
 * Read the most recent signal scores for each portfolio symbol from the
 * Firestore `signals` collection (written by the Python MCP backend).
 *
 * Returns entries sorted by score descending.  Symbols with no signal
 * document are silently omitted.
 *
 * Free-tier impact: one query per call, returning at most symbols.length
 * documents.  With 5-minute ISR this stays well under 50K reads/day.
 */
export async function readPortfolioSignals(
  symbols: string[],
): Promise<SignalEntry[]> {
  if (symbols.length === 0) return [];

  try {
    const db = getDb();

    // Query each symbol individually so we reliably get the most recent
    // document without needing a composite index.
    const perSymbolSnaps = await Promise.allSettled(
      symbols.map((sym) =>
        db
          .collection("signals")
          .where("symbol", "==", sym)
          .orderBy("timestamp", "desc")
          .limit(1)
          .get(),
      ),
    );

    const entries: SignalEntry[] = [];
    for (const result of perSymbolSnaps) {
      if (result.status !== "fulfilled" || result.value.empty) continue;
      const d = result.value.docs[0].data();
      entries.push({
        symbol: d.symbol,
        score: d.summary?.avg_score ?? 0,
        bullish: d.summary?.bullish ?? 0,
        bearish: d.summary?.bearish ?? 0,
        price: d.price ?? 0,
        change: d.change ?? 0,
      });
    }

    return entries.sort((a, b) => b.score - a.score);
  } catch {
    return [];
  }
}
