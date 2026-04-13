globalThis.process ??= {};
globalThis.process.env ??= {};
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
async function isPageEnabled(d1, settingKey, kv) {
  if (!d1) return true;
  try {
    const settings = await batchGetSettings(d1, [settingKey], kv);
    const value = settings.get(settingKey);
    if (value !== void 0 && value !== "true") return false;
  } catch {
  }
  return true;
}
async function batchGetSettings(d1, keys, kv) {
  if (kv && keys.length > 0) {
    const cacheKey = `settings:batch:${keys.sort().join(",")}`;
    const cached = await kv.get(cacheKey);
    if (cached) {
      try {
        return new Map(Object.entries(JSON.parse(cached)));
      } catch {
      }
    }
  }
  const result = await _batchGetFromD1(d1, keys);
  if (kv && keys.length > 0) {
    const cacheKey = `settings:batch:${keys.sort().join(",")}`;
    try {
      await kv.put(cacheKey, JSON.stringify(Object.fromEntries(result)), {
        expirationTtl: 300
      });
    } catch {
    }
  }
  return result;
}
async function _batchGetFromD1(d1, keys) {
  const result = /* @__PURE__ */ new Map();
  if (!d1 || keys.length === 0) return result;
  try {
    const placeholders = keys.map(() => "?").join(", ");
    const rows = await d1.prepare(`SELECT key, value FROM site_settings WHERE key IN (${placeholders})`).bind(...keys).all();
    for (const row of rows.results) {
      result.set(row.key, row.value);
    }
  } catch {
  }
  return result;
}
async function getD1() {
  const env = await getEnv();
  return env.DB;
}
export {
  batchGetSettings as b,
  getD1 as g,
  isPageEnabled as i
};
