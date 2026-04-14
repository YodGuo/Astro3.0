globalThis.process ??= {};
globalThis.process.env ??= {};
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
import { r as requireAdmin, A as AuthError } from "./auth-guard_B5bfjxXB.mjs";
import { g as apiForbidden, f as apiUnauthorized, b as apiUnavailable, d as apiSuccess, e as apiError } from "./api-response_DQ3MgLJ0.mjs";
const prerender = false;
const GET = async ({ locals, url }) => {
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
    const sinceId = url.searchParams.get("since");
    let query;
    let bindings = [];
    if (sinceId) {
      query = `
        SELECT n.* FROM notification_logs n
        INNER JOIN (
          SELECT created_at FROM notification_logs WHERE id = ?
        ) ref ON n.created_at > ref.created_at OR (n.created_at = ref.created_at AND n.id > ?)
        ORDER BY n.created_at ASC, n.id ASC
        LIMIT 20
      `;
      bindings = [sinceId, sinceId];
    } else {
      query = "SELECT * FROM notification_logs ORDER BY created_at DESC LIMIT 5";
    }
    const stmt = d1.prepare(query);
    const result = bindings.length > 0 ? await stmt.bind(...bindings).all() : await stmt.all();
    const rows = result.results || [];
    const notifications = rows.map((r) => {
      const eventData = r.event_data ? JSON.parse(r.event_data) : null;
      return {
        eventType: r.event_type,
        data: eventData,
        logId: r.id,
        status: r.status,
        channelType: r.channel_type,
        recipient: r.recipient,
        errorMessage: r.error_message,
        createdAt: r.created_at
      };
    });
    const response = apiSuccess(notifications);
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    return response;
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
