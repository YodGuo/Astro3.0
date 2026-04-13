import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export function getDBFromEnv(env: { DB?: D1Database }) {
  if (!env.DB) return null;
  return drizzle(env.DB, { schema });
}

/**
 * Wraps D1Database.prepare().all() to handle both wrangler v3 ({ results: [] })
 * and wrangler v4 (direct array []) return formats.
 */
export async function d1All<T>(d1: D1Database, query: string, ...bindings: unknown[]): Promise<T[]> {
  const stmt = bindings.length > 0 ? d1.prepare(query).bind(...bindings as D1Value[]) : d1.prepare(query);
  const result = await stmt.all();
  if (Array.isArray(result)) return result as T[];
  return ((result as { results?: unknown[] }).results || []) as T[];
}
