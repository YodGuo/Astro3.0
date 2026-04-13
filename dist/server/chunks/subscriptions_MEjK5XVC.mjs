globalThis.process ??= {};
globalThis.process.env ??= {};
import { f as d1All } from "./index_BdvyDh_N.mjs";
import { r as requireAdmin, A as AuthError } from "./auth-guard_B5bfjxXB.mjs";
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
import { g as apiForbidden, f as apiUnauthorized, b as apiUnavailable, a as apiBadRequest, d as apiSuccess, e as apiError } from "./api-response_DQ3MgLJ0.mjs";
import { o as object, a as array, s as string } from "./sequence_IbtNAemG.mjs";
const prerender = false;
const subscriptionSchema = object({
  channelId: string().min(1),
  eventTypes: array(string()).min(1)
});
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
  const channelId = url.searchParams.get("channelId");
  if (!channelId) {
    return apiBadRequest("channelId query parameter is required");
  }
  try {
    const result = await d1All(d1, "SELECT * FROM notification_subscriptions WHERE channel_id = ?", channelId);
    return apiSuccess(result);
  } catch (e) {
    return apiError(e);
  }
};
const PUT = async ({ request, locals }) => {
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
    const parsed = subscriptionSchema.safeParse(body);
    if (!parsed.success) {
      return apiBadRequest(JSON.stringify(parsed.error.flatten()));
    }
    const { channelId, eventTypes } = parsed.data;
    await d1.prepare("DELETE FROM notification_subscriptions WHERE channel_id = ?").bind(channelId).run();
    for (const eventType of eventTypes) {
      const id = crypto.randomUUID();
      await d1.prepare("INSERT INTO notification_subscriptions (id, channel_id, event_type) VALUES (?, ?, ?)").bind(id, channelId, eventType).run();
    }
    return apiSuccess({ success: true, channelId, eventTypes });
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
