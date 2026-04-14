globalThis.process ??= {};
globalThis.process.env ??= {};
import { l as logger } from "./logger_CoNHAtH6.mjs";
const CACHE_KEY = "notification:all_settings";
const CACHE_TTL = 60;
const CACHE_STALE_TTL = 300;
async function getAllNotificationSettings(ctx) {
  const kv = ctx.env?.SETTINGS_CACHE;
  if (!kv) {
    return await getAllSettingsFromD1(ctx);
  }
  try {
    const cached = await kv.get(CACHE_KEY);
    if (cached) {
      const { data, cachedAt } = JSON.parse(cached);
      const age = (Date.now() - cachedAt) / 1e3;
      if (age < CACHE_TTL) {
        return data;
      }
      if (age < CACHE_STALE_TTL) {
        const executionCtx = ctx.env?.__cloudflare_execution_context;
        if (executionCtx) {
          executionCtx.waitUntil(revalidateCache(ctx, kv));
        }
        return data;
      }
    }
  } catch (error) {
    logger.warn("Failed to read from KV cache", { error: String(error) });
  }
  const settings = await getAllSettingsFromD1(ctx);
  try {
    const payload = JSON.stringify({ data: settings, cachedAt: Date.now() });
    await kv.put(CACHE_KEY, payload, { expirationTtl: CACHE_STALE_TTL });
  } catch (error) {
    logger.warn("Failed to write to KV cache", { error: String(error) });
  }
  return settings;
}
async function revalidateCache(ctx, kv) {
  try {
    const settings = await getAllSettingsFromD1(ctx);
    const payload = JSON.stringify({ data: settings, cachedAt: Date.now() });
    await kv.put(CACHE_KEY, payload, { expirationTtl: CACHE_STALE_TTL });
  } catch (error) {
    logger.warn("Background revalidation failed", { error: String(error) });
  }
}
async function getNotificationSetting(ctx, key) {
  const allSettings = await getAllNotificationSettings(ctx);
  return allSettings[key] || null;
}
async function clearNotificationSettingsCache(ctx) {
  const kv = ctx.env?.SETTINGS_CACHE;
  if (kv) {
    try {
      await kv.delete(CACHE_KEY);
    } catch (error) {
      logger.warn("Failed to clear KV cache", { error: String(error) });
    }
  }
}
async function getAllSettingsFromD1(ctx) {
  try {
    const result = await ctx.db.prepare("SELECT key, value FROM notification_settings").all();
    const settings = {};
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
export {
  clearNotificationSettingsCache as c,
  getNotificationSetting as g
};
