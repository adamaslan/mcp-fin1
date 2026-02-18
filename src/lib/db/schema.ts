import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  real,
  jsonb,
  primaryKey,
  foreignKey,
} from "drizzle-orm/pg-core";

// Users table (synced with Clerk)
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user ID
  email: text("email").notNull(),
  tier: text("tier").notNull().default("free"), // 'free' | 'pro' | 'max'
  tierUpdatedAt: timestamp("tier_updated_at"),
  tierUpdatedBy: text("tier_updated_by"), // Admin who changed tier
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Watchlists table
export const watchlists = pgTable("watchlists", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  symbols: text("symbols").array().notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Positions table (for portfolio tracking)
export const positions = pgTable("positions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  symbol: text("symbol").notNull(),
  shares: real("shares").notNull(),
  entryPrice: real("entry_price").notNull(),
  entryDate: timestamp("entry_date").notNull(),
  notes: text("notes"),
  status: text("status").default("open"), // 'open' | 'closed'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Trade Journal table
export const tradeJournal = pgTable("trade_journal", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  symbol: text("symbol").notNull(),
  entryPrice: real("entry_price").notNull(),
  exitPrice: real("exit_price"),
  shares: real("shares").notNull(),
  pnl: real("pnl"),
  pnlPercent: real("pnl_percent"),
  tradePlanSnapshot: jsonb("trade_plan_snapshot"),
  entryDate: timestamp("entry_date").notNull(),
  exitDate: timestamp("exit_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Usage tracking table (for tier limits)
export const usageTracking = pgTable("usage_tracking", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // YYYY-MM-DD
  analysisCount: integer("analysis_count").default(0),
  scanCount: integer("scan_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Alerts table (Max tier only)
export const alerts = pgTable("alerts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  symbol: text("symbol").notNull(),
  alertType: text("alert_type").notNull(), // 'price' | 'signal' | 'suppression'
  condition: jsonb("condition").notNull(),
  isActive: boolean("is_active").default(true),
  lastTriggered: timestamp("last_triggered"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// MCP Presets table (user's saved tool configurations)
export const mcpPresets = pgTable("mcp_presets", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // e.g., "My Aggressive Setup"
  description: text("description"),
  toolName: text("tool_name").notNull(), // e.g., "analyze_security"
  parameters: jsonb("parameters").notNull(), // { period: "1mo", use_ai: true }
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// MCP Runs table (execution history for all tool runs)
export const mcpRuns = pgTable("mcp_runs", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  toolName: text("tool_name").notNull(), // e.g., "analyze_security"
  parameters: jsonb("parameters").notNull(), // { symbol: "AAPL", period: "1mo" }
  result: jsonb("result"), // Full response from MCP
  status: text("status").notNull().default("running"), // "running" | "success" | "error"
  executionTime: integer("execution_time"), // Milliseconds
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Public Latest Runs table (cached for landing page)
export const publicLatestRuns = pgTable("public_latest_runs", {
  id: text("id").primaryKey(),
  toolName: text("tool_name").notNull().unique(), // One per tool
  symbol: text("symbol"), // For display (e.g., "SPY")
  result: jsonb("result").notNull(), // Cached result from latest run
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Re-export Fibonacci signals from separate file
export {
  fibonacciSignalHistory,
  type FibonacciSignalHistory,
  type FibonacciSignalHistoryInsert,
} from "./fibonacci_signals";
