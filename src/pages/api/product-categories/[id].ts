import type { APIRoute } from "astro";
import { getDBFromEnv } from "../../../lib/db";
import { productCategories, products } from "../../../lib/db/schema";
import { eq, count } from "drizzle-orm";
import { requireAdmin, AuthError } from "../../../lib/auth-guard";
import { apiError, apiSuccess, apiUnavailable, apiBadRequest, apiNotFound } from "../../../lib/api-response";
import { getEnv } from "../../../lib/env";

export const prerender = false;

// GET /api/product-categories/[id] — Get a single category (with product count)
export const GET: APIRoute = async ({ params }) => {
  const { id } = params;
  if (!id) return apiBadRequest("Missing id");
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");

  try {
    const [rows, countResult] = await Promise.all([
      db.select().from(productCategories).where(eq(productCategories.id, id)).limit(1),
      db.select({ total: count() }).from(products).where(eq(products.categoryId, id)),
    ]);
    if (rows.length === 0) {
      return apiNotFound("Category");
    }

    return apiSuccess({ ...rows[0], productCount: countResult[0].total });
  } catch (error) {
    return apiError(error);
  }
};

// PUT /api/product-categories/[id] — Update a category
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
    const body = await request.json() as { name?: string; parentId?: string | null; order?: number };
    const { name, parentId, order } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return apiBadRequest("name is required");
    }

    const slug = name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const updated = await db.update(productCategories)
      .set({
        name: name.trim(),
        slug,
        parentId: parentId !== undefined ? (parentId || null) : undefined,
        order: order !== undefined ? order : undefined,
      })
      .where(eq(productCategories.id, id))
      .returning();

    if (updated.length === 0) {
      return apiNotFound("Category");
    }

    return apiSuccess(updated[0]);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    const cause = error instanceof Error && error.cause instanceof Error ? error.cause.message : "";
    if (msg.includes("UNIQUE") || cause.includes("UNIQUE") || cause.includes("SQLITE_CONSTRAINT_UNIQUE")) {
      return apiBadRequest("Category with this slug already exists", "CONFLICT");
    }
    return apiError(error);
  }
};

// DELETE /api/product-categories/[id] — Delete a category
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
    // Clear categoryId on products that reference this category
    await db.update(products).set({ categoryId: null }).where(eq(products.categoryId, id));

    // Delete the category
    const deleted = await db.delete(productCategories).where(eq(productCategories.id, id)).returning();

    if (deleted.length === 0) {
      return apiNotFound("Category");
    }

    return apiSuccess({ success: true, deleted: deleted[0] });
  } catch (error) {
    return apiError(error);
  }
};
