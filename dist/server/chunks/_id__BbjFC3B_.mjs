globalThis.process ??= {};
globalThis.process.env ??= {};
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
import { g as getDBFromEnv, m as media, e as eq } from "./index_BdvyDh_N.mjs";
import { r as requireAdmin, A as AuthError } from "./auth-guard_B5bfjxXB.mjs";
import { l as logger } from "./logger_CoNHAtH6.mjs";
import { f as apiUnauthorized, g as apiForbidden, c as apiNotFound, b as apiUnavailable, d as apiSuccess, e as apiError } from "./api-response_DQ3MgLJ0.mjs";
const prerender = false;
const DELETE = async ({ params, locals }) => {
  try {
    requireAdmin(locals);
  } catch (e) {
    if (e instanceof AuthError) {
      if (e.status === 401) return apiUnauthorized(e.message);
      return apiForbidden(e.message);
    }
    throw e;
  }
  const { id } = params;
  if (!id) return apiNotFound("Media");
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");
  try {
    const rows = await db.select().from(media).where(eq(media.id, id)).limit(1);
    if (rows.length === 0) return apiNotFound("Media");
    const record = rows[0];
    await db.delete(media).where(eq(media.id, id));
    if (env.R2) {
      try {
        await env.R2.delete(record.key);
      } catch (err) {
        logger.warn("Failed to delete R2 object", { key: record.key, error: String(err) });
      }
    }
    return apiSuccess({ ok: true, deleted: record.key });
  } catch (error) {
    return apiError(error);
  }
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DELETE,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
