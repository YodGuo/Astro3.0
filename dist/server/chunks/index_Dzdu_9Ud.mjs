globalThis.process ??= {};
globalThis.process.env ??= {};
import { g as getDBFromEnv, e as eq, h as products, s as sql } from "./index_BdvyDh_N.mjs";
import { p as publishNotificationEvent } from "./notification.publisher_gE8ktshy.mjs";
import { N as NOTIFICATION_EVENTS } from "./template-engine_CUBCH2lW.mjs";
import { l as logger } from "./logger_CoNHAtH6.mjs";
import { b as apiUnavailable, e as apiError, a as apiBadRequest, d as apiSuccess } from "./api-response_DQ3MgLJ0.mjs";
import { r as requireAdmin } from "./auth-guard_B5bfjxXB.mjs";
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
import { v as validateBody, e as createProductSchema } from "./validations_B2RLnuYh.mjs";
import { s as slugify, e as ensureUniqueSlug } from "./slug_CPOWZBpk.mjs";
import { c as count } from "./aggregate_C5aFahLf.mjs";
const prerender = false;
const GET = async ({ url }) => {
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");
  try {
    const page2 = Math.max(1, parseInt(url.searchParams.get("page") || "1") || 1);
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20") || 20));
    const offset = (page2 - 1) * limit;
    const publishedOnly = url.searchParams.get("published") === "true";
    const whereCondition = publishedOnly ? eq(products.published, true) : void 0;
    const [countResult, rows] = await Promise.all([
      db.select({ total: count() }).from(products).where(whereCondition),
      db.select({
        id: products.id,
        slug: products.slug,
        name: products.name,
        summary: products.summary,
        description: products.description,
        published: products.published,
        categoryId: products.categoryId,
        createdAt: products.createdAt
      }).from(products).where(whereCondition).orderBy(sql`${products.createdAt} desc`).limit(limit).offset(offset)
    ]);
    return new Response(
      JSON.stringify({ ok: true, data: { data: rows, total: countResult[0].total, page: page2, limit } }),
      { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" } }
    );
  } catch (error) {
    return apiError(error);
  }
};
const POST = async ({ request, locals }) => {
  requireAdmin(locals);
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");
  try {
    const parsedBody = await request.json();
    const { data, error: validationError } = validateBody(createProductSchema, parsedBody);
    if (validationError || !data) return apiBadRequest(validationError);
    const { name, summary, description, published, categoryId } = data;
    const id = crypto.randomUUID();
    let slug = slugify(name);
    const RESERVED_SLUGS = ["page", "other", "all", "index"];
    if (RESERVED_SLUGS.includes(slug)) {
      return apiBadRequest(`Slug "${slug}" is a reserved word and cannot be used`);
    }
    if (env.DB) slug = await ensureUniqueSlug(env.DB, "products", slug);
    const isPublished = published === true;
    await db.insert(products).values({ id, slug, name, summary: summary || null, description: description || null, published: isPublished, categoryId: categoryId || null });
    if (isPublished && env.DB) {
      publishNotificationEvent(
        { db: env.DB, env },
        {
          type: NOTIFICATION_EVENTS.PRODUCT_PUBLISHED,
          data: {
            productName: name,
            productUrl: `/products/${slug}`,
            summary: summary || void 0
          }
        }
      ).catch((err) => {
        logger.error("Failed to send notification", { context: "product-create", error: String(err) });
      });
    }
    return apiSuccess({ id, slug }, 201);
  } catch (error) {
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
