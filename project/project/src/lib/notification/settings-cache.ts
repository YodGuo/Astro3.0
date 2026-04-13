import type { NotificationContext } from "./queue-consumer";
import { logger } from "../logger";

// ── Types ────────────────────────────────────────

export type NotificationSettingsMap = Record<string, any>;

// ── Cache Keys ───────────────────────────────────

const CACHE_KEY = 'notification:all_settings';
const CACHE_TTL = 60; // 1 minute — fresh data TTL
const CACHE_STALE_TTL = 300; // 5 minutes — stale data kept for SWR

// ── Get All Settings (with KV + SWR Cache) ──────

/**
 * Get all notification settings from D1, with KV caching and SWR.
 *
 * Strategy:
 * - Fresh (age < CACHE_TTL): return cached value immediately
 * - Stale (CACHE_TTL ≤ age < CACHE_STALE_TTL): return stale value immediately,
 *   revalidate in background via waitUntil
 * - Expired (age ≥ CACHE_STALE_TTL): fetch from D1, update cache
 * - Miss: fetch from D1, update cache
 *
 * @param ctx Notification context with DB and optional env (for KV)
 * @returns Map of all notification settings
 */
export async function getAllNotificationSettings(
  ctx: NotificationContext
): Promise<NotificationSettingsMap> {
  const kv = ctx.env?.SETTINGS_CACHE as KVNamespace | undefined;
  if (!kv) {
    return await getAllSettingsFromD1(ctx);
  }

  // Try to get cached value + metadata
  try {
    const cached = await kv.get(CACHE_KEY);
    if (cached) {
      const { data, cachedAt } = JSON.parse(cached) as { data: NotificationSettingsMap; cachedAt: number };
      const age = (Date.now() - cachedAt) / 1000;

      if (age < CACHE_TTL) {
        // Fresh — return immediately
        return data;
      }

      if (age < CACHE_STALE_TTL) {
        // Stale — return immediately, revalidate in background
        const executionCtx = ctx.env?.__cloudflare_execution_context as ExecutionContext | undefined;
        if (executionCtx) {
          executionCtx.waitUntil(revalidateCache(ctx, kv));
        }
        return data;
      }

      // Expired — fall through to D1 fetch
    }
  } catch (error) {
    logger.warn("Failed to read from KV cache", { error: String(error) });
  }

  // Cache miss or expired — fetch from D1
  const settings = await getAllSettingsFromD1(ctx);

  try {
    const payload = JSON.stringify({ data: settings, cachedAt: Date.now() });
    await kv.put(CACHE_KEY, payload, { expirationTtl: CACHE_STALE_TTL });
  } catch (error) {
    logger.warn("Failed to write to KV cache", { error: String(error) });
  }

  return settings;
}

// ── Background Revalidation ──────────────────────

async function revalidateCache(
  ctx: NotificationContext,
  kv: KVNamespace
): Promise<void> {
  try {
    const settings = await getAllSettingsFromD1(ctx);
    const payload = JSON.stringify({ data: settings, cachedAt: Date.now() });
    await kv.put(CACHE_KEY, payload, { expirationTtl: CACHE_STALE_TTL });
  } catch (error) {
    logger.warn("Background revalidation failed", { error: String(error) });
  }
}

// ── Get Single Setting (with Cache) ──────────────

/**
 * Get a single notification setting by key
 */
export async function getNotificationSetting(
  ctx: NotificationContext,
  key: string
): Promise<any> {
  const allSettings = await getAllNotificationSettings(ctx);
  return allSettings[key] || null;
}

// ── Clear Cache ──────────────────────────────────

/**
 * Clear the notification settings cache
 */
export async function clearNotificationSettingsCache(
  ctx: NotificationContext
): Promise<void> {
  const kv = ctx.env?.SETTINGS_CACHE as KVNamespace | undefined;
  if (kv) {
    try {
      await kv.delete(CACHE_KEY);
    } catch (error) {
      logger.warn("Failed to clear KV cache", { error: String(error) });
    }
  }
}

// ── Helper: Get All Settings from D1 ─────────────

async function getAllSettingsFromD1(
  ctx: NotificationContext
): Promise<NotificationSettingsMap> {
  try {
    const result = await ctx.db
      .prepare('SELECT key, value FROM notification_settings')
      .all() as { results: Array<{ key: string; value: string }> };

    const settings: NotificationSettingsMap = {};
    for (const row of result.results) {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch {
        settings[row.key] = row.value;
      }
    }

    return settings;
  } catch (error) {
    logger.error("Failed to get settings from D1", { error: String(error) });
    return {};
  }
}
