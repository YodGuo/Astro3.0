globalThis.process ??= {};
globalThis.process.env ??= {};
import { f as d1All } from "./index_BdvyDh_N.mjs";
import { r as requireAdmin, A as AuthError } from "./auth-guard_B5bfjxXB.mjs";
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
import { g as apiForbidden, f as apiUnauthorized, b as apiUnavailable, d as apiSuccess, e as apiError, a as apiBadRequest } from "./api-response_DQ3MgLJ0.mjs";
import { o as object, b as boolean, f as record, _ as _enum, s as string, u as unknown } from "./sequence_IbtNAemG.mjs";
const prerender = false;
const createChannelSchema = object({
  name: string().min(1),
  type: _enum(["email", "webhook"]),
  config: record(string(), unknown()).optional().default({}),
  enabled: boolean().optional().default(true)
});
const GET = async ({ locals }) => {
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
    const result = await d1All(
      d1,
      `SELECT nc.id, nc.name, nc.type, nc.config, nc.enabled, nc.created_at, nc.updated_at,
        GROUP_CONCAT(ns.event_type) as subscribed_events
       FROM notification_channels nc
       LEFT JOIN notification_subscriptions ns ON ns.channel_id = nc.id
       GROUP BY nc.id
       ORDER BY nc.created_at DESC`
    );
    const channels = result.map((r) => ({
      ...r,
      config: r.config ? JSON.parse(r.config) : {},
      enabled: r.enabled === 1,
      subscribedEvents: r.subscribed_events ? r.subscribed_events.split(",") : []
    }));
    return apiSuccess(channels);
  } catch (e) {
    return apiError(e);
  }
};
const POST = async ({ request, locals }) => {
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
    const body = await request.json();
    const parsed = createChannelSchema.safeParse(body);
    if (!parsed.success) {
      return apiBadRequest(JSON.stringify(parsed.error.flatten()));
    }
    const { name, type, config, enabled } = parsed.data;
    const id = crypto.randomUUID();
    await d1.prepare(
      `INSERT INTO notification_channels (id, name, type, config, enabled) VALUES (?, ?, ?, ?, ?)`
    ).bind(id, name, type, JSON.stringify(config), enabled ? 1 : 0).run();
    return apiSuccess({ id, name, type, config, enabled }, 201);
  } catch (e) {
    return apiError(e);
  }
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
