globalThis.process ??= {};
globalThis.process.env ??= {};
import { f as d1All } from "./index_BdvyDh_N.mjs";
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
import { r as requireAdmin, A as AuthError } from "./auth-guard_B5bfjxXB.mjs";
import { g as apiForbidden, f as apiUnauthorized, b as apiUnavailable, d as apiSuccess, e as apiError } from "./api-response_DQ3MgLJ0.mjs";
const prerender = false;
const GET = async ({ url, locals }) => {
  try {
    requireAdmin(locals);
  } catch (e) {
    if (e instanceof AuthError) {
      return e.status === 403 ? apiForbidden(e.message) : apiUnauthorized(e.message);
    }
    throw e;
  }
  const env = await getEnv();
  const d1 = env.DB;
  if (!d1) return apiUnavailable("DB not available");
  try {
    const eventType = url.searchParams.get("eventType");
    const status = url.searchParams.get("status");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);
    const offset = parseInt(url.searchParams.get("offset") || "0");
    let query = "SELECT * FROM notification_logs";
    const conditions = [];
    const bindings = [];
    if (eventType) {
      conditions.push("event_type = ?");
      bindings.push(eventType);
    }
    if (status) {
      conditions.push("status = ?");
      bindings.push(status);
    }
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    bindings.push(limit, offset);
    const result = await d1All(d1, query, ...bindings);
    const logs = result.map((r) => ({
      ...r,
      eventData: r.event_data ? JSON.parse(r.event_data) : null
    }));
    return apiSuccess(logs);
  } catch (e) {
    return apiError(e);
  }
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
