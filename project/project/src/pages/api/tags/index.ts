import type { APIRoute } from "astro";
import { getDBFromEnv } from "../../../lib/db";
import { tags } from "../../../lib/db/schema";
import { sql, desc } from "drizzle-orm";
import { requireAdmin, AuthError } from "../../../lib/auth-guard";
import { apiError, apiSuccess, apiUnavailable, apiBadRequest } from "../../../lib/api-response";
import { getEnv } from "../../../lib/env";
import { createTagSchema, validateBody } from "../../../lib/validations";

export const prerender = false;

// GET /api/tags?withCount=true — List all tags (optionally with post count)
export const GET: APIRoute = async ({ url }) => {
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");

  try {
    const withCount = url.searchParams.get("withCount") === "true";

    if (withCount) {
      // List tags with post count using a subquery
      const rows = await db
        .select({
          id: tags.id,
          name: tags.name,
          slug: tags.slug,
          postCount: sql<number>`(SELECT COUNT(*) FROM news_post_tags WHERE tag_id = ${tags.id})`.as("post_count"),
        })
        .from(tags)
        .orderBy(desc(sql`post_count`));

      return apiSuccess(rows);
    }

    // Simple list without count
    const rows = await db.select().from(tags).orderBy(desc(tags.id));
    return apiSuccess(rows);
  } catch (error) {
    return apiError(error);
  }
};

// POST /api/tags — Create a new tag
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    requireAdmin(locals);
  } catch (e) {
    if (e instanceof AuthError) {
      return e.status === 401 ? apiUnauthorized(e.message) : apiForbidden(e.message);
    }
    throw e;
  }
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");

  try {
    const parsedBody = await request.json();
    const { data, error: validationError } = validateBody(createTagSchema, parsedBody);
    if (validationError || !data) return apiBadRequest(validationError || "Validation failed");
    const { name, slug } = data;

    const finalSlug = slug || name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const id = crypto.randomUUID();

    await db.insert(tags).values({ id, name: name.trim(), slug: finalSlug });

    return apiSuccess({ id, name: name.trim(), slug: finalSlug }, 201);
  } catch (error: unknown) {
    // D1 UNIQUE constraint errors are wrapped by Drizzle
    const msg = error instanceof Error ? error.message : String(error);
    const cause = error instanceof Error && error.cause instanceof Error ? error.cause.message : "";
    if (msg.includes("UNIQUE") || cause.includes("UNIQUE") || cause.includes("SQLITE_CONSTRAINT_UNIQUE")) {
      return apiBadRequest("Tag with this name already exists", "CONFLICT");
    }
    return apiError(error);
  }
};
