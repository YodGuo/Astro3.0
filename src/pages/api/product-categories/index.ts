import type { APIRoute } from "astro";
import { getDBFromEnv } from "../../../lib/db";
import { productCategories } from "../../../lib/db/schema";
import { sql } from "drizzle-orm";
import { requireAdmin, AuthError } from "../../../lib/auth-guard";
import { apiError, apiSuccess, apiUnavailable, apiBadRequest } from "../../../lib/api-response";
import { getEnv } from "../../../lib/env";
import { createCategorySchema, validateBody } from "../../../lib/validations";

export const prerender = false;

// GET /api/product-categories — List all categories (optionally with product count)
export const GET: APIRoute = async ({ url }) => {
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");

  try {
    const withCount = url.searchParams.get("withCount") === "true";

    if (withCount) {
      const rows = await db
        .select({
          id: productCategories.id,
          name: productCategories.name,
          slug: productCategories.slug,
          parentId: productCategories.parentId,
          order: productCategories.order,
          productCount: sql<number>`(SELECT COUNT(*) FROM products WHERE category_id = product_categories.id AND published = 1)`.as("product_count"),
        })
        .from(productCategories)
        .orderBy(productCategories.order, productCategories.name);

      return apiSuccess(rows);
    }

    const rows = await db.select().from(productCategories).orderBy(productCategories.order, productCategories.name);
    return apiSuccess(rows);
  } catch (error) {
    return apiError(error);
  }
};

// POST /api/product-categories — Create a new category
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
    const { data, error: validationError } = validateBody(createCategorySchema, parsedBody);
    if (validationError || !data) return apiBadRequest(validationError || "Validation failed");
    const { name, slug } = data;

    const finalSlug = slug || name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const id = crypto.randomUUID();

    await db.insert(productCategories).values({
      id,
      name: name.trim(),
      slug: finalSlug,
      parentId: null,
      order: 0,
    });

    return apiSuccess({ id, name: name.trim(), slug: finalSlug, parentId: null, order: 0 }, 201);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    const cause = error instanceof Error && error.cause instanceof Error ? error.cause.message : "";
    if (msg.includes("UNIQUE") || cause.includes("UNIQUE") || cause.includes("SQLITE_CONSTRAINT_UNIQUE")) {
      return apiBadRequest("Category with this slug already exists", "CONFLICT");
    }
    return apiError(error);
  }
};
