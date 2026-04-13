import type { APIRoute } from "astro";
import { getDBFromEnv } from "../../../../lib/db";
import { newsPosts, tags, newsPostTags } from "../../../../lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { requireAdmin, AuthError } from "../../../../lib/auth-guard";
import { apiError, apiUnavailable, apiBadRequest, apiNotFound, apiSuccess, apiUnauthorized, apiForbidden } from "../../../../lib/api-response";
import { getEnv } from "../../../../lib/env";

export const prerender = false;

// GET /api/news/[id]/tags — Get tags for a news post
export const GET: APIRoute = async ({ params }) => {
  const { id } = params;
  if (!id) return apiBadRequest("Missing id");
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");

  try {
    // Verify post exists
    const post = await db.select({ id: newsPosts.id }).from(newsPosts).where(eq(newsPosts.id, id)).limit(1);
    if (post.length === 0) {
      return apiNotFound("Post");
    }

    // Get tag IDs for this post
    const postTagRows = await db.select({ tagId: newsPostTags.tagId }).from(newsPostTags).where(eq(newsPostTags.postId, id));

    if (postTagRows.length === 0) {
      return apiSuccess([]);
    }

    // Get tag details
    const tagIds = postTagRows.map(r => r.tagId);
    const tagDetails = await db.select().from(tags).where(inArray(tags.id, tagIds));

    return apiSuccess(tagDetails);
  } catch (error) {
    return apiError(error);
  }
};

// PUT /api/news/[id]/tags — Set tags for a news post (replaces all existing tags)
export const PUT: APIRoute = async ({ params, request, locals }) => {
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
    const body = await request.json() as { tagIds?: string[] };
    const { tagIds } = body;

    if (!Array.isArray(tagIds)) {
      return apiBadRequest("tagIds must be an array");
    }

    // Verify post exists
    const post = await db.select({ id: newsPosts.id }).from(newsPosts).where(eq(newsPosts.id, id)).limit(1);
    if (post.length === 0) {
      return apiNotFound("Post");
    }

    // Validate all tags exist (if any provided)
    if (tagIds.length > 0) {
      const existingTags = await db.select({ id: tags.id }).from(tags).where(inArray(tags.id, tagIds));
      if (existingTags.length !== tagIds.length) {
        const existingIds = new Set(existingTags.map(t => t.id));
        const invalidIds = tagIds.filter(id => !existingIds.has(id));
        return apiBadRequest(`Invalid tag IDs: ${invalidIds.join(", ")}`);
      }
    }

    // Delete existing associations
    await db.delete(newsPostTags).where(eq(newsPostTags.postId, id));

    // Insert new associations
    if (tagIds.length > 0) {
      await db.insert(newsPostTags).values(
        tagIds.map(tagId => ({ postId: id, tagId }))
      );
    }

    return apiSuccess({ success: true, tagCount: tagIds.length });
  } catch (error) {
    return apiError(error);
  }
};
