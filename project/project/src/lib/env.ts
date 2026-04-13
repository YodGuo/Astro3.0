/**
 * Unified environment accessor for Cloudflare Workers.
 *
 * Eliminates the repeated boilerplate in every API route:
 * ```ts
 * // OLD (repeated in ~50 places):
 * let env: { DB?: D1Database };
 * try { const cfEnv = await import("cloudflare:workers"); env = cfEnv.env; } catch { env = {}; }
 *
 * // NEW:
 * import { getEnv } from "../../lib/env";
 * const env = await getEnv();
 * ```
 */

export interface AppEnv {
  DB?: D1Database;
  R2?: R2Bucket;
  SETTINGS_CACHE?: KVNamespace;
  SESSION?: KVNamespace;
  ADMIN_EMAIL?: string;
  [key: string]: unknown;
}

/**
 * Get the Cloudflare Workers environment bindings.
 * Returns an empty object if not running in a Workers context (e.g., during prerendering).
 */
export async function getEnv(): Promise<AppEnv> {
  try {
    const cfEnv = await import("cloudflare:workers");
    return (cfEnv.env || {}) as AppEnv;
  } catch {
    return {};
  }
}
