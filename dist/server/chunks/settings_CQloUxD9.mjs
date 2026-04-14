globalThis.process ??= {};
globalThis.process.env ??= {};
import { f as d1All } from "./index_BdvyDh_N.mjs";
import { r as requireAdmin, A as AuthError } from "./auth-guard_B5bfjxXB.mjs";
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
import { e as apiError, d as apiSuccess, g as apiForbidden, f as apiUnauthorized, a as apiBadRequest } from "./api-response_DQ3MgLJ0.mjs";
const prerender = false;
const ALLOWED_KEYS = /* @__PURE__ */ new Set([
  // Page visibility
  "homepage_enabled",
  "about_enabled",
  "services_enabled",
  "products_enabled",
  "news_enabled",
  "solutions_enabled",
  "solutions_data-centers_enabled",
  "solutions_healthcare_enabled",
  "solutions_industrial_enabled",
  "solutions_telecommunications_enabled",
  "solutions_finance_enabled",
  "solutions_government_enabled",
  // Site branding
  "site_name",
  "site_description",
  "site_logo_url",
  "site_favicon_url",
  "site_og_image_url",
  // Social
  "social_links",
  // Domain isolation
  "public_domain",
  "admin_domain",
  // Theme
  "theme_brand_color",
  "theme_font_family",
  "dark_mode_enabled",
  // Analytics & legal
  "ga_measurement_id",
  "privacy_enabled",
  "terms_enabled"
]);
const GET = async (_ctx) => {
  try {
    requireAdmin(_ctx);
    const env = await getEnv();
    const d1 = env.DB;
    if (!d1) return apiError("DB not available", 500, "SERVICE_UNAVAILABLE");
    const rows = await d1All(d1, "SELECT key, value FROM site_settings");
    const settings = {};
    for (const row of rows) {
      if (row.value === "true" || row.value === "false") {
        settings[row.key] = row.value === "true";
      } else {
        settings[row.key] = row.value;
      }
    }
    const response = apiSuccess(settings);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (e) {
    return apiError(e);
  }
};
const PUT = async (ctx) => {
  try {
    requireAdmin(ctx);
  } catch (e) {
    if (e instanceof AuthError) {
      return e.status === 403 ? apiForbidden(e.message) : apiUnauthorized(e.message);
    }
    throw e;
  }
  try {
    const body = await ctx.request.json();
    const { key, value } = body;
    if (!key || typeof key !== "string" || !ALLOWED_KEYS.has(key)) {
      return apiBadRequest(`Unknown setting key: ${key}`, "INVALID_SETTING_KEY");
    }
    const env = await getEnv();
    const d1 = env.DB;
    if (!d1) return apiError("DB not available", 500, "SERVICE_UNAVAILABLE");
    const strValue = typeof value === "boolean" ? value ? "true" : "false" : String(value);
    await d1.prepare("INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").bind(key, strValue).run();
    try {
      const kv = env.SETTINGS_CACHE;
      if (kv) {
        const list = await kv.list({ prefix: "settings:batch:" });
        const deletions = list.keys.map((k) => kv.delete(k.name));
        await Promise.all(deletions);
      }
    } catch {
    }
    return apiSuccess({ success: true });
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
