import type { APIRoute } from "astro";
import { getDBFromEnv } from "../../../lib/db";
import { tags, newsPostTags } from "../../../lib/db/schema";
import { eq, count } from "drizzle-orm";
import { requireAdmin, AuthError } from "../../../lib/auth-guard";
import { apiError, apiSuccess, apiUnavailable, apiBadRequest, apiNotFound } from "../../../lib/api-response";
import { getEnv } from "../../../lib/env";

export const prerender = false;

// GET /api/tags/[id] — Get a single tag (with post count)
export const GET: APIRoute = async ({ params }) => {
  const { id } = params;
  if (!id) return apiBadRequest("Missing id");
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");

  try {
    const [rows, countResult] = await Promise.all([
      db.select().from(tags).where(eq(tags.id, id)).limit(1),
      db.select({ total: count() }).from(newsPostTags).where(eq(newsPostTags.tagId, id)),
    ]);
    if (rows.length === 0) {
      return apiNotFound("Tag");
    }

    return apiSuccess({ ...rows[0], postCount: countResult[0].total });
  } catch (error) {
    return apiError(error);
  }
};

// PUT /api/tags/[id] — Update a tag
export const PUT: APIRoute = async ({ params, request, locals }) => {
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
    const body = await request.json() as { name?: string };
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return apiBadRequest("name is required");
    }

    if (name.length > 50) {
      return apiBadRequest("name must be 50 characters or less");
    }

    const slug = name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const updated = await db.update(tags)
      .set({ name: name.trim(), slug })
      .where(eq(tags.id, id))
      .returning();

    if (updated.length === 0) {
      return apiNotFound("Tag");
    }

    return apiSuccess(updated[0]);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    const cause = error instanceof Error && error.cause instanceof Error ? error.cause.message : "";
    if (msg.includes("UNIQUE") || cause.includes("UNIQUE") || cause.includes("SQLITE_CONSTRAINT_UNIQUE")) {
      return apiBadRequest("Tag with this name already exists", "CONFLICT");
    }
    return apiError(error);
  }
};

// DELETE /api/tags/[id] — Delete a tag (and remove associations)
export const DELETE: APIRoute = async ({ params, locals }) => {
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
    // First remove all post-tag associations
    await db.delete(newsPostTags).where(eq(newsPostTags.tagId, id));

    // Then delete the tag itself
    const deleted = await db.delete(tags).where(eq(tags.id, id)).returning();

    if (deleted.length === 0) {
      return apiNotFound("Tag");
    }

    return apiSuccess({ success: true, deleted: deleted[0] });
  } catch (error) {
    return apiError(error);
  }
};
