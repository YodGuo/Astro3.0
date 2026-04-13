globalThis.process ??= {};
globalThis.process.env ??= {};
import { r as requireAdmin, A as AuthError } from "./auth-guard_B5bfjxXB.mjs";
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
import { g as apiForbidden, f as apiUnauthorized, a as apiBadRequest, b as apiUnavailable, d as apiSuccess, e as apiError, c as apiNotFound } from "./api-response_DQ3MgLJ0.mjs";
import { o as object, b as boolean, f as record, _ as _enum, s as string, u as unknown } from "./sequence_IbtNAemG.mjs";
const prerender = false;
const updateChannelSchema = object({
  name: string().min(1).optional(),
  type: _enum(["email", "webhook"]).optional(),
  config: record(string(), unknown()).optional(),
  enabled: boolean().optional()
});
const GET = async ({ params, locals }) => {
  try {
    requireAdmin(locals);
  } catch (e) {
    if (e instanceof AuthError) {
      return e.status === 403 ? apiForbidden(e.message) : apiUnauthorized(e.message);
    }
    throw e;
  }
  const { id } = params;
  if (!id) return apiBadRequest("Missing id");
  const env = await getEnv();
  const d1 = env.DB;
  if (!d1) return apiUnavailable("DB not available");
  const result = await d1.prepare("SELECT * FROM notification_channels WHERE id = ?").bind(id).first();
  if (!result) {
    return apiNotFound("Channel");
  }
  return apiSuccess({
    ...result,
    config: result.config ? JSON.parse(result.config) : {},
    enabled: result.enabled === 1
  });
};
const PUT = async ({ params, request, locals }) => {
  try {
    requireAdmin(locals);
  } catch (e) {
    if (e instanceof AuthError) {
      return e.status === 403 ? apiForbidden(e.message) : apiUnauthorized(e.message);
    }
    throw e;
  }
  const { id } = params;
  if (!id) return apiBadRequest("Missing id");
  const env = await getEnv();
  const d1 = env.DB;
  if (!d1) return apiUnavailable("DB not available");
  try {
    const body = await request.json();
    const parsed = updateChannelSchema.safeParse(body);
    if (!parsed.success) {
      return apiBadRequest(JSON.stringify(parsed.error.flatten()));
    }
    const updates = [];
    const bindings = [];
    if (parsed.data.name !== void 0) {
      updates.push("name = ?");
      bindings.push(parsed.data.name);
    }
    if (parsed.data.type !== void 0) {
      updates.push("type = ?");
      bindings.push(parsed.data.type);
    }
    if (parsed.data.config !== void 0) {
      updates.push("config = ?");
      bindings.push(JSON.stringify(parsed.data.config));
    }
    if (parsed.data.enabled !== void 0) {
      updates.push("enabled = ?");
      bindings.push(parsed.data.enabled ? 1 : 0);
    }
    if (updates.length === 0) {
      return apiBadRequest("No fields to update");
    }
    updates.push("updated_at = unixepoch()");
    bindings.push(id);
    await d1.prepare(`UPDATE notification_channels SET ${updates.join(", ")} WHERE id = ?`).bind(...bindings).run();
    return apiSuccess({ success: true });
  } catch (e) {
    return apiError(e);
  }
};
const DELETE = async ({ params, locals }) => {
  try {
    requireAdmin(locals);
  } catch (e) {
    if (e instanceof AuthError) {
      return e.status === 403 ? apiForbidden(e.message) : apiUnauthorized(e.message);
    }
    throw e;
  }
  const { id } = params;
  if (!id) return apiBadRequest("Missing id");
  const env = await getEnv();
  const d1 = env.DB;
  if (!d1) return apiUnavailable("DB not available");
  try {
    await d1.prepare("DELETE FROM notification_channels WHERE id = ?").bind(id).run();
    return apiSuccess({ success: true });
  } catch (e) {
    return apiError(e);
  }
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DELETE,
  GET,
  PUT,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
