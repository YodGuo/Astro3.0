import type { APIRoute } from "astro";
import { getDBFromEnv } from "../../../lib/db";
import { solutions } from "../../../lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin, AuthError } from "../../../lib/auth-guard";
import { updateSolutionSchema, validateBody } from "../../../lib/validations";
import { apiError, apiSuccess, apiUnavailable, apiBadRequest, apiNotFound } from "../../../lib/api-response";
import { getEnv } from "../../../lib/env";

export const prerender = false;

// GET /api/solutions/:id — Get a single solution
export const GET: APIRoute = async ({ params }) => {
  const { id } = params;
  if (!id) return apiBadRequest("Missing id");
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");
  const rows = await db.select().from(solutions).where(eq(solutions.id, id)).limit(1);
  if (rows.length === 0) return apiNotFound("Solution");
  return apiSuccess(rows[0]);
};

// PUT /api/solutions/:id — Update a solution (admin only)
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
    const raw = await request.json();
    const validation = validateBody(updateSolutionSchema, raw);
    if (validation.error) return apiBadRequest(validation.error);
    const body = validation.data;
    await db.update(solutions).set({
      title: body.title ?? undefined,
      industry: body.industry ?? undefined,
      content: body.content ?? undefined,
    }).where(eq(solutions.id, id));
    // Return the updated record
    const rows = await db.select().from(solutions).where(eq(solutions.id, id)).limit(1);
    return apiSuccess(rows[0] || { ok: true });
  } catch (error) {
    return apiError(error);
  }
};

// DELETE /api/solutions/:id — Delete a solution (admin only)
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
    await db.delete(solutions).where(eq(solutions.id, id));
    return apiSuccess({ ok: true });
  } catch (error) {
    return apiError(error);
  }
};
