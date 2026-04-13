import type { APIRoute } from "astro";
import { d1All } from "../../lib/db";
import { requireAdmin, AuthError } from "../../lib/auth-guard";
import { getEnv } from "../../lib/env";
import { apiError, apiSuccess, apiUnauthorized, apiForbidden, apiBadRequest } from "../../lib/api-response";

export const prerender = false;

/** Allowed setting keys — prevents arbitrary key writes */
const ALLOWED_KEYS = new Set([
  // Page visibility
  "homepage_enabled", "about_enabled", "services_enabled",
  "products_enabled", "news_enabled", "solutions_enabled",
  "solutions_data-centers_enabled", "solutions_healthcare_enabled",
  "solutions_industrial_enabled", "solutions_telecommunications_enabled",
  "solutions_finance_enabled", "solutions_government_enabled",
  // Site branding
  "site_name", "site_description", "site_logo_url",
  "site_favicon_url", "site_og_image_url",
  // Social
  "social_links",
  // Domain isolation
  "public_domain", "admin_domain",
  // Theme
  "theme_brand_color", "theme_font_family",
  "dark_mode_enabled",
  // Analytics & legal
  "ga_measurement_id", "privacy_enabled", "terms_enabled",
]);

// GET /api/settings - 获取所有设置
export const GET: APIRoute = async (_ctx) => {
  try {
    requireAdmin(_ctx);
    const env = await getEnv();
    const d1 = env.DB;
    if (!d1) return apiError("DB not available", 500, "SERVICE_UNAVAILABLE");

    const rows = await d1All<{ key: string; value: string }>(d1, "SELECT key, value FROM site_settings");
    const settings: Record<string, string | boolean> = {};
    for (const row of rows) {
      // Boolean-like values (page toggles)
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

// PUT /api/settings - 更新或创建设置（UPSERT）
export const PUT: APIRoute = async (ctx) => {
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
    const { key, value } = body as { key: string; value: boolean | string };

    // Key whitelist validation
    if (!key || typeof key !== "string" || !ALLOWED_KEYS.has(key)) {
      return apiBadRequest(`Unknown setting key: ${key}`, "INVALID_SETTING_KEY");
    }

    const env = await getEnv();
    const d1 = env.DB;
    if (!d1) return apiError("DB not available", 500, "SERVICE_UNAVAILABLE");

    const strValue = typeof value === "boolean" ? (value ? "true" : "false") : String(value);

    // UPSERT: insert if not exists, update if exists
    await d1
      .prepare("INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
      .bind(key, strValue)
      .run();

    // Invalidate KV cache so next read fetches fresh data
    try {
      const kv = env.SETTINGS_CACHE;
      if (kv) {
        // List and delete all settings cache keys
        const list = await kv.list({ prefix: "settings:batch:" });
        const deletions = list.keys.map((k) => kv.delete(k.name));
        await Promise.all(deletions);
      }
    } catch {
      // KV invalidation failure is non-critical — cache will expire within 5 min
    }

    return apiSuccess({ success: true });
  } catch (e) {
    return apiError(e);
  }
};
