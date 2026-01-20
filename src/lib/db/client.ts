import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Initialize database connection
let db: any;

if (process.env.DATABASE_URL) {
  try {
    // Create postgres connection
    const client = postgres(process.env.DATABASE_URL, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });

    // Initialize Drizzle with schema for relational queries
    db = drizzle(client, { schema });

    console.info("✓ Connected to PostgreSQL database");
  } catch (error) {
    console.error("Failed to connect to PostgreSQL:", error);
    throw new Error(
      "Database connection failed. Check DATABASE_URL and ensure PostgreSQL is running.",
    );
  }
} else {
  throw new Error(
    "DATABASE_URL is required. Please set it in your .env.local file.\n" +
      "Example: DATABASE_URL=postgresql://user:password@localhost:5432/mcp_finance",
  );
}

export { db };

// Re-export schema for convenience
export * from "./schema";
