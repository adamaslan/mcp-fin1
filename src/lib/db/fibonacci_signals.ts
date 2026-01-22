import {
  pgTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  index,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Fibonacci Signal History Table
 *
 * Tracks all Fibonacci signals detected during analysis for backtesting
 * and performance measurement over time.
 *
 * Records include:
 * - Signal details (name, category, strength)
 * - Fibonacci level information (price, confluence score)
 * - Multi-timeframe alignment status
 * - Historical price outcomes (30d, 90d)
 * - Performance metrics (return %, price achieved)
 */
export const fibonacciSignalHistory = pgTable(
  "fibonacci_signal_history",
  {
    // Identifiers
    id: uuid("id").primaryKey().defaultRandom(),
    symbol: varchar("symbol", { length: 10 }).notNull(),

    // Timing
    timestamp: timestamp("timestamp", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    // Signal Information
    signal: text("signal").notNull(),
    category: varchar("category", { length: 50 }).notNull(),
    strength: varchar("strength", { length: 20 }).notNull(),

    // Price Information at Signal Detection
    priceAtSignal: decimal("price_at_signal", {
      precision: 10,
      scale: 2,
    }).notNull(),

    // Fibonacci Level Information
    levelPrice: decimal("level_price", { precision: 10, scale: 2 }).notNull(),
    levelName: varchar("level_name", { length: 100 }),

    // Confluence Metrics
    confluenceScore: decimal("confluence_score", {
      precision: 5,
      scale: 2,
    }).notNull(),
    multiTimeframeAligned: boolean("multi_timeframe_aligned")
      .notNull()
      .default(false),

    // Outcome Tracking (populated later by a backtest job)
    outcomePriceAfter30d: decimal("outcome_price_30d", {
      precision: 10,
      scale: 2,
    }),
    outcomePriceAfter90d: decimal("outcome_price_90d", {
      precision: 10,
      scale: 2,
    }),

    // Return Calculations
    outcomeReturnPercent30d: decimal("outcome_return_percent_30d", {
      precision: 8,
      scale: 3,
    }),
    outcomeReturnPercent90d: decimal("outcome_return_percent_90d", {
      precision: 8,
      scale: 3,
    }),

    // Additional Metadata
    signalDescription: text("signal_description"),
    metadata: text("metadata"), // JSON stored as text
  },
  (table) => ({
    // Indexes for efficient querying
    symbolIdx: index("idx_fib_signals_symbol").on(table.symbol),
    timestampIdx: index("idx_fib_signals_timestamp").on(table.timestamp),
    strengthIdx: index("idx_fib_signals_strength").on(table.strength),
    categoryIdx: index("idx_fib_signals_category").on(table.category),
    confluenceIdx: index("idx_fib_signals_confluence").on(
      table.confluenceScore,
    ),
    symbolTimestampIdx: index("idx_fib_signals_symbol_timestamp").on(
      table.symbol,
      table.timestamp,
    ),
  }),
);

export type FibonacciSignalHistory = typeof fibonacciSignalHistory.$inferSelect;
export type FibonacciSignalHistoryInsert =
  typeof fibonacciSignalHistory.$inferInsert;
