import type { APIRoute } from "astro";
import { getDBFromEnv } from "../../../lib/db";
import { solutions } from "../../../lib/db/schema";
import { requireAdmin, AuthError } from "../../../lib/auth-guard";
import { getEnv } from "../../../lib/env";
import { apiError, apiSuccess, apiUnavailable, apiBadRequest } from "../../../lib/api-response";
import { createSolutionSchema, validateBody } from "../../../lib/validations";
import { slugify, ensureUniqueSlug } from "../../../lib/slug";

export const prerender = false;

// GET /api/solutions — List all solutions
export const GET: APIRoute = async () => {
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");

  try {
    const rows = await db.select({
      id: solutions.id,
      slug: solutions.slug,
      industry: solutions.industry,
      title: solutions.title,
      content: solutions.content,
    }).from(solutions);

    return apiSuccess(rows);
  } catch (error) {
    return apiError(error);
  }
};

// POST /api/solutions — Create a new solution (admin only)
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
    const { data, error: validationError } = validateBody(createSolutionSchema, parsedBody);
    if (validationError || !data) return apiBadRequest(validationError || "Validation failed");
    const { title, industry, content } = data;
    const id = crypto.randomUUID();
    let slug = slugify(title);
    if (env.DB) slug = await ensureUniqueSlug(env.DB, "solutions", slug);
    await db.insert(solutions).values({ id, slug, industry, title, content: content || null });
    return apiSuccess({ id, slug }, 201);
  } catch (error) {
    return apiError(error);
  }
};
