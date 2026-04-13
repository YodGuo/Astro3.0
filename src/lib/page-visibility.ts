import { getEnv } from "./env";

/**
 * Check if a page is enabled via site_settings table.
 * Uses KV cache when available (via batchGetSettings).
 * Returns true if enabled (or if D1 is not available — fail-open).
 */
export async function isPageEnabled(
  d1: D1Database | undefined,
  settingKey: string,
  kv?: KVNamespace | null
): Promise<boolean> {
  if (!d1) return true;
  try {
    const settings = await batchGetSettings(d1, [settingKey], kv);
    const value = settings.get(settingKey);
    if (value !== undefined && value !== 'true') return false;
  } catch { /* fail-open */ }
  return true;
}

/**
 * Batch-fetch multiple site_settings keys in a single D1 query.
 * Returns a Map<key, value> for all matched rows.
 * Missing keys are simply absent from the map.
 */
export async function batchGetSettings(
  d1: D1Database | undefined,
  keys: string[],
  kv?: KVNamespace | null
): Promise<Map<string, string>> {
  // 先尝试 KV 缓存
  if (kv && keys.length > 0) {
    const cacheKey = `settings:batch:${keys.sort().join(',')}`;
    const cached = await kv.get(cacheKey);
    if (cached) {
      try {
        return new Map(Object.entries(JSON.parse(cached)));
      } catch { /* fail to memory */ }
    }
  }

  // KV miss，查 D1
  const result = await _batchGetFromD1(d1, keys);

  // 写入 KV 缓存（5分钟 TTL）
  if (kv && keys.length > 0) {
    const cacheKey = `settings:batch:${keys.sort().join(',')}`;
    try {
      await kv.put(cacheKey, JSON.stringify(Object.fromEntries(result)), {
        expirationTtl: 300,
      });
    } catch { /* fail to cache */ }
  }

  return result;
}

/**
 * Internal: Fetch settings from D1 database.
 */
async function _batchGetFromD1(
  d1: D1Database | undefined,
  keys: string[]
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (!d1 || keys.length === 0) return result;
  try {
    const placeholders = keys.map(() => "?").join(", ");
    const rows = await d1
      .prepare(`SELECT key, value FROM site_settings WHERE key IN (${placeholders})`)
      .bind(...keys)
      .all<{ key: string; value: string }>();
    for (const row of rows.results) {
      result.set(row.key, row.value);
    }
  } catch { /* fail-open */ }
  return result;
}

/**
 * Get D1 instance from Cloudflare Workers env.
 */
export async function getD1(): Promise<D1Database | undefined> {
  const env = await getEnv();
  return env.DB;
}

/**
 * Get KV namespace from Cloudflare Workers env.
 */
export async function getKV(): Promise<KVNamespace | undefined> {
  const env = await getEnv();
  return env.SETTINGS_CACHE;
}
