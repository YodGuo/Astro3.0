globalThis.process ??= {};
globalThis.process.env ??= {};
import { g as getDBFromEnv, k as solutions, e as eq } from "./index_BdvyDh_N.mjs";
import { r as requireAdmin, A as AuthError } from "./auth-guard_B5bfjxXB.mjs";
import { v as validateBody, g as updateSolutionSchema } from "./validations_B2RLnuYh.mjs";
import { a as apiBadRequest, b as apiUnavailable, d as apiSuccess, e as apiError, c as apiNotFound } from "./api-response_DQ3MgLJ0.mjs";
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
const prerender = false;
const GET = async ({ params }) => {
  const { id } = params;
  if (!id) return apiBadRequest("Missing id");
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");
  const rows = await db.select().from(solutions).where(eq(solutions.id, id)).limit(1);
  if (rows.length === 0) return apiNotFound("Solution");
  return apiSuccess(rows[0]);
};
const PUT = async ({ params, request, locals }) => {
  try {
    requireAdmin(locals);
  } catch (e) {
    if (e instanceof AuthError) {
      return e.status === 401 ? apiUnauthorized(e.message) : apiForbidden(e.message);
    }
    throw e;
  }
  const { id } = params;
  if (!id) return apiBadRequest("Missing id");
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");
  try {
    const raw = await request.json();
    const validation = validateBody(updateSolutionSchema, raw);
    if (validation.error) return apiBadRequest(validation.error);
    const body = validation.data;
    await db.update(solutions).set({
      title: body.title ?? void 0,
      industry: body.industry ?? void 0,
      content: body.content ?? void 0
    }).where(eq(solutions.id, id));
    const rows = await db.select().from(solutions).where(eq(solutions.id, id)).limit(1);
    return apiSuccess(rows[0] || { ok: true });
  } catch (error) {
    return apiError(error);
  }
};
const DELETE = async ({ params, locals }) => {
  try {
    requireAdmin(locals);
  } catch (e) {
    if (e instanceof AuthError) {
      return e.status === 401 ? apiUnauthorized(e.message) : apiForbidden(e.message);
    }
    throw e;
  }
  const { id } = params;
  if (!id) return apiBadRequest("Missing id");
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");
  try {
    await db.delete(solutions).where(eq(solutions.id, id));
    return apiSuccess({ ok: true });
  } catch (error) {
    return apiError(error);
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
