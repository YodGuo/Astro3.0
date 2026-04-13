globalThis.process ??= {};
globalThis.process.env ??= {};
import { t as templateKey, g as getAvailableVariables, A as ALL_SUBSCRIBABLE_EVENTS } from "./template-engine_CUBCH2lW.mjs";
import { f as d1All } from "./index_BdvyDh_N.mjs";
import { r as requireAdmin, A as AuthError } from "./auth-guard_B5bfjxXB.mjs";
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
import { g as apiForbidden, f as apiUnauthorized, b as apiUnavailable, a as apiBadRequest, d as apiSuccess, e as apiError } from "./api-response_DQ3MgLJ0.mjs";
import { o as object, s as string } from "./sequence_IbtNAemG.mjs";
const updateTemplateSchema = object({
  eventType: string().min(1),
  subject: string().max(500).optional().nullable(),
  body: string().max(1e4).optional().nullable(),
  title: string().max(200).optional().nullable(),
  text: string().max(5e3).optional().nullable()
});
const prerender = false;
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
      "SELECT key, value, updated_at FROM notification_settings WHERE key LIKE 'template:%'"
    );
    const templates = result.map((row) => {
      let parsed = {};
      try {
        parsed = JSON.parse(row.value);
      } catch {
      }
      return {
        eventType: row.key.replace("template:", ""),
        subject: parsed.subject || null,
        body: parsed.body || null,
        title: parsed.title || null,
        text: parsed.text || null,
        variables: getAvailableVariables(row.key.replace("template:", "")),
        updatedAt: row.updated_at ?? 0
      };
    });
    const existingTypes = new Set(templates.map((t) => t.eventType));
    for (const eventType of ALL_SUBSCRIBABLE_EVENTS) {
      if (!existingTypes.has(eventType)) {
        templates.push({
          eventType,
          subject: null,
          body: null,
          title: null,
          text: null,
          variables: getAvailableVariables(eventType),
          updatedAt: 0
        });
      }
    }
    return apiSuccess(templates);
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
    const raw = await request.json();
    const parsed = updateTemplateSchema.safeParse(raw);
    if (!parsed.success) {
      return apiBadRequest(parsed.error.issues.map((i) => i.message).join("; "));
    }
    const body = parsed.data;
    if (!ALL_SUBSCRIBABLE_EVENTS.includes(body.eventType)) {
      return apiBadRequest(`Invalid event type. Must be one of: ${ALL_SUBSCRIBABLE_EVENTS.join(", ")}`);
    }
    const key = templateKey(body.eventType);
    const value = JSON.stringify({
      subject: body.subject || null,
      body: body.body || null,
      title: body.title || null,
      text: body.text || null
    });
    await d1.prepare(
      `INSERT INTO notification_settings (key, value, updated_at) VALUES (?, ?, unixepoch())
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = unixepoch()`
    ).bind(key, value).run();
    return apiSuccess({ success: true, eventType: body.eventType });
  } catch (e) {
    return apiError(e);
  }
};
const DELETE = async ({ url, locals }) => {
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
  const eventType = url.searchParams.get("eventType");
  if (!eventType) {
    return apiBadRequest("eventType query parameter is required");
  }
  try {
    const key = templateKey(eventType);
    await d1.prepare("DELETE FROM notification_settings WHERE key = ?").bind(key).run();
    return apiSuccess({ success: true, eventType });
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
