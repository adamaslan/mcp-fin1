import { drizzle } from "drizzle-orm/postgres-js";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Lazy-load database connection to avoid initialization during build
let cachedDb: PostgresJsDatabase<typeof schema> | null = null;
let dbInitialized = false;
let initError: Error | null = null;

function getDb() {
  if (dbInitialized) {
    if (initError) throw initError;
    return cachedDb;
  }

  // Skip initialization if DATABASE_URL not set (allows build to complete)
  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === "production") {
      initError = new Error(
        "DATABASE_URL is required in production. Please set it in your environment.",
      );
      throw initError;
    }
    // In development/build, just warn and continue
    return null;
  }

  try {
    // Create postgres connection
    const client = postgres(process.env.DATABASE_URL, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });

    // Initialize Drizzle with schema for relational queries
    cachedDb = drizzle(client, { schema });
    dbInitialized = true;

    if (process.env.NODE_ENV === "development") {
      console.info("✓ Connected to PostgreSQL database");
    }
    return cachedDb;
  } catch (error) {
    initError = error instanceof Error ? error : new Error(String(error));
    console.error("Failed to connect to PostgreSQL:", initError);
    if (process.env.NODE_ENV === "production") {
      throw initError;
    }
    return null;
  }
}

// Export db object that initializes lazily
export const db = {
  get query() {
    return getDb()?.query;
  },
  get select() {
    return getDb()?.select;
  },
  get insert() {
    return getDb()?.insert;
  },
  get update() {
    return getDb()?.update;
  },
  get delete() {
    return getDb()?.delete;
  },
  // Allow any other Drizzle methods to be accessed
  [Symbol.iterator]: () => getDb()?.[Symbol.iterator]?.(),
} as unknown as PostgresJsDatabase<typeof schema>;

// Re-export schema for convenience
export * from "./schema";
