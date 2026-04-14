globalThis.process ??= {};
globalThis.process.env ??= {};
import { f as d1All } from "./index_BdvyDh_N.mjs";
import { r as requireAdmin, A as AuthError } from "./auth-guard_B5bfjxXB.mjs";
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
import { c as clearNotificationSettingsCache } from "./settings-cache_BN3ad_JY.mjs";
import { f as apiUnauthorized, g as apiForbidden, b as apiUnavailable, d as apiSuccess, e as apiError, a as apiBadRequest } from "./api-response_DQ3MgLJ0.mjs";
const prerender = false;
const NOTIFICATION_SETTING_KEYS = /* @__PURE__ */ new Set([
  "sse_enabled",
  "toast_preferences",
  "rate_limit"
  // Template keys follow the pattern "template:<eventType>"
]);
const GET = async ({ locals }) => {
  try {
    requireAdmin(locals);
  } catch (e) {
    if (e instanceof AuthError) {
      if (e.status === 401) return apiUnauthorized(e.message);
      return apiForbidden(e.message);
    }
    throw e;
  }
  const env = await getEnv();
  const d1 = env.DB;
  if (!d1) return apiUnavailable("DB not available");
  try {
    const result = await d1All(d1, "SELECT key, value FROM notification_settings");
    const settings = {};
    for (const row of result) {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch {
        settings[row.key] = row.value;
      }
    }
    return apiSuccess(settings);
  } catch (e) {
    return apiError(e);
  }
};
const PUT = async ({ request, locals }) => {
  requireAdmin(locals);
  const env = await getEnv();
  const d1 = env.DB;
  if (!d1) return apiUnavailable("DB not available");
  try {
    const body = await request.json();
    if (!body.key || typeof body.key !== "string") {
      return apiBadRequest("key is required");
    }
    if (!NOTIFICATION_SETTING_KEYS.has(body.key) && !body.key.startsWith("template:")) {
      return apiBadRequest(`Invalid notification setting key: ${body.key}`);
    }
    if (body.value === void 0 || body.value === null) {
      return apiBadRequest("value is required");
    }
    const valueStr = typeof body.value === "string" ? body.value : JSON.stringify(body.value);
    if (valueStr.length > 5e4) {
      return apiBadRequest("value too large (max 50000 characters)");
    }
    const value = typeof body.value === "string" ? body.value : JSON.stringify(body.value);
    await d1.prepare(
      `INSERT INTO notification_settings (key, value, updated_at) VALUES (?, ?, unixepoch())
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = unixepoch()`
    ).bind(body.key, value).run();
    await clearNotificationSettingsCache({ db: d1, env });
    return apiSuccess({ success: true, key: body.key });
  } catch (e) {
    return apiError(e);
  }
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET,
  PUT,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
