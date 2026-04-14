globalThis.process ??= {};
globalThis.process.env ??= {};
import { g as getDBFromEnv, s as sql, j as productCategories } from "./index_BdvyDh_N.mjs";
import { r as requireAdmin, A as AuthError } from "./auth-guard_B5bfjxXB.mjs";
import { b as apiUnavailable, d as apiSuccess, e as apiError, a as apiBadRequest } from "./api-response_DQ3MgLJ0.mjs";
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
import { v as validateBody, b as createCategorySchema } from "./validations_B2RLnuYh.mjs";
const prerender = false;
const GET = async ({ url }) => {
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");
  try {
    const withCount = url.searchParams.get("withCount") === "true";
    if (withCount) {
      const rows2 = await db.select({
        id: productCategories.id,
        name: productCategories.name,
        slug: productCategories.slug,
        parentId: productCategories.parentId,
        order: productCategories.order,
        productCount: sql`(SELECT COUNT(*) FROM products WHERE category_id = product_categories.id AND published = 1)`.as("product_count")
      }).from(productCategories).orderBy(productCategories.order, productCategories.name);
      return apiSuccess(rows2);
    }
    const rows = await db.select().from(productCategories).orderBy(productCategories.order, productCategories.name);
    return apiSuccess(rows);
  } catch (error) {
    return apiError(error);
  }
};
const POST = async ({ request, locals }) => {
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
      order: 0
    });
    return apiSuccess({ id, name: name.trim(), slug: finalSlug, parentId: null, order: 0 }, 201);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const cause = error instanceof Error && error.cause instanceof Error ? error.cause.message : "";
    if (msg.includes("UNIQUE") || cause.includes("UNIQUE") || cause.includes("SQLITE_CONSTRAINT_UNIQUE")) {
      return apiBadRequest("Category with this slug already exists", "CONFLICT");
    }
    return apiError(error);
  }
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
