globalThis.process ??= {};
globalThis.process.env ??= {};
import { g as getDBFromEnv, n as newsPosts, e as eq, b as newsPostTags, t as tags, i as inArray } from "./index_BdvyDh_N.mjs";
import { r as requireAdmin, A as AuthError } from "./auth-guard_B5bfjxXB.mjs";
import { a as apiBadRequest, b as apiUnavailable, c as apiNotFound, d as apiSuccess, e as apiError, g as apiForbidden, f as apiUnauthorized } from "./api-response_DQ3MgLJ0.mjs";
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
const prerender = false;
const GET = async ({ params }) => {
  const { id } = params;
  if (!id) return apiBadRequest("Missing id");
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");
  try {
    const post = await db.select({ id: newsPosts.id }).from(newsPosts).where(eq(newsPosts.id, id)).limit(1);
    if (post.length === 0) {
      return apiNotFound("Post");
    }
    const postTagRows = await db.select({ tagId: newsPostTags.tagId }).from(newsPostTags).where(eq(newsPostTags.postId, id));
    if (postTagRows.length === 0) {
      return apiSuccess([]);
    }
    const tagIds = postTagRows.map((r) => r.tagId);
    const tagDetails = await db.select().from(tags).where(inArray(tags.id, tagIds));
    return apiSuccess(tagDetails);
  } catch (error) {
    return apiError(error);
  }
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
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");
  try {
    const body = await request.json();
    const { tagIds } = body;
    if (!Array.isArray(tagIds)) {
      return apiBadRequest("tagIds must be an array");
    }
    const post = await db.select({ id: newsPosts.id }).from(newsPosts).where(eq(newsPosts.id, id)).limit(1);
    if (post.length === 0) {
      return apiNotFound("Post");
    }
    if (tagIds.length > 0) {
      const existingTags = await db.select({ id: tags.id }).from(tags).where(inArray(tags.id, tagIds));
      if (existingTags.length !== tagIds.length) {
        const existingIds = new Set(existingTags.map((t) => t.id));
        const invalidIds = tagIds.filter((id2) => !existingIds.has(id2));
        return apiBadRequest(`Invalid tag IDs: ${invalidIds.join(", ")}`);
      }
    }
    await db.delete(newsPostTags).where(eq(newsPostTags.postId, id));
    if (tagIds.length > 0) {
      await db.insert(newsPostTags).values(
        tagIds.map((tagId) => ({ postId: id, tagId }))
      );
    }
    return apiSuccess({ success: true, tagCount: tagIds.length });
  } catch (error) {
    return apiError(error);
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
