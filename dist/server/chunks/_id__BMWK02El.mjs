globalThis.process ??= {};
globalThis.process.env ??= {};
import { g as getDBFromEnv, b as newsPostTags, e as eq, t as tags } from "./index_BdvyDh_N.mjs";
import { r as requireAdmin, A as AuthError } from "./auth-guard_B5bfjxXB.mjs";
import { a as apiBadRequest, b as apiUnavailable, c as apiNotFound, d as apiSuccess, e as apiError } from "./api-response_DQ3MgLJ0.mjs";
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
import { c as count } from "./aggregate_C5aFahLf.mjs";
const prerender = false;
const GET = async ({ params }) => {
  const { id } = params;
  if (!id) return apiBadRequest("Missing id");
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");
  try {
    const [rows, countResult] = await Promise.all([
      db.select().from(tags).where(eq(tags.id, id)).limit(1),
      db.select({ total: count() }).from(newsPostTags).where(eq(newsPostTags.tagId, id))
    ]);
    if (rows.length === 0) {
      return apiNotFound("Tag");
    }
    return apiSuccess({ ...rows[0], postCount: countResult[0].total });
  } catch (error) {
    return apiError(error);
  }
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
    const body = await request.json();
    const { name } = body;
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return apiBadRequest("name is required");
    }
    if (name.length > 50) {
      return apiBadRequest("name must be 50 characters or less");
    }
    const slug = name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const updated = await db.update(tags).set({ name: name.trim(), slug }).where(eq(tags.id, id)).returning();
    if (updated.length === 0) {
      return apiNotFound("Tag");
    }
    return apiSuccess(updated[0]);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const cause = error instanceof Error && error.cause instanceof Error ? error.cause.message : "";
    if (msg.includes("UNIQUE") || cause.includes("UNIQUE") || cause.includes("SQLITE_CONSTRAINT_UNIQUE")) {
      return apiBadRequest("Tag with this name already exists", "CONFLICT");
    }
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
    await db.delete(newsPostTags).where(eq(newsPostTags.tagId, id));
    const deleted = await db.delete(tags).where(eq(tags.id, id)).returning();
    if (deleted.length === 0) {
      return apiNotFound("Tag");
    }
    return apiSuccess({ success: true, deleted: deleted[0] });
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
