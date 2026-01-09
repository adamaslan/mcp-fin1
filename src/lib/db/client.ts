import * as schema from './schema';

// Stub database client for development
// In production, this will be properly initialized with a real database
// For now, this prevents build errors and allows the app to run in development mode

// Mock database for development without DATABASE_URL
const mockDb = {
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
} as any;

// Export mock database
// In production with DATABASE_URL set, real database would be initialized here
export const db = mockDb;

// Re-export schema for convenience
export * from './schema';
