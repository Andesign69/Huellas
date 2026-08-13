import "server-only";
import { Pool, type QueryResultRow } from "pg";

// Next.js reloads this module on every edit in dev; without stashing the
// pool on globalThis each reload would open a fresh set of connections
// against Postgres until it runs out.
const globalForDb = globalThis as unknown as { huellasPool?: Pool };

const connectionString = process.env.DATABASE_URL;

export const dbConfigured = Boolean(connectionString);

if (!dbConfigured) {
  console.warn("Falta DATABASE_URL. Copia .env.local.example a .env.local y complétalo.");
}

export const pool =
  globalForDb.huellasPool ??
  new Pool({
    connectionString: connectionString || "postgres://placeholder:placeholder@localhost:5432/placeholder",
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.huellasPool = pool;
}

export function query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]) {
  return pool.query<T>(text, params);
}
