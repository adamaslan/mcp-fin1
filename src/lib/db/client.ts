import * as schema from './schema';

// Mock database for development without DATABASE_URL
const createMockDb = () => ({
  query: {
    users: {
      findFirst: () => Promise.resolve(null),
      findMany: () => Promise.resolve([]),
    },
    watchlists: {
      findFirst: () => Promise.resolve(null),
      findMany: () => Promise.resolve([]),
    },
    positions: {
      findFirst: () => Promise.resolve(null),
      findMany: () => Promise.resolve([]),
    },
    tradeJournal: {
      findFirst: () => Promise.resolve(null),
      findMany: () => Promise.resolve([]),
    },
    alerts: {
      findFirst: () => Promise.resolve(null),
      findMany: () => Promise.resolve([]),
    },
  },
  insert: () => ({
    values: () => ({
      returning: () => Promise.resolve([]),
    }),
  }),
  update: () => ({
    set: () => ({
      where: () => ({
        returning: () => Promise.resolve([]),
      }),
    }),
  }),
  delete: () => ({
    where: () => ({
      returning: () => Promise.resolve([]),
    }),
  }),
} as any);

// Initialize database based on environment
let db: any;

// Use mock database by default for development
// When DATABASE_URL is set in production, install postgres: npm install postgres
db = createMockDb();

// If DATABASE_URL is set, try to initialize real database at runtime
if (process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
  // In production, expect postgres to be installed
  try {
    const { drizzle } = require('drizzle-orm/postgres-js');
    const postgres = require('postgres');
    const client = postgres(process.env.DATABASE_URL);
    db = drizzle(client, { schema });
    console.info('✓ Connected to PostgreSQL database');
  } catch (error) {
    console.error('Failed to connect to PostgreSQL:', error);
    console.error('Make sure to install: npm install postgres');
    throw new Error('Database initialization failed');
  }
}

// Development without DATABASE_URL or before NODE_ENV set
if (!process.env.DATABASE_URL && !db) {
  console.warn(
    'DATABASE_URL not set. Using in-memory mock database for development.\n' +
      'For production, set DATABASE_URL and install postgres: npm install postgres'
  );
  db = createMockDb();
}

export { db };

// Re-export schema for convenience
export * from './schema';
