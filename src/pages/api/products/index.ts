import type { APIRoute } from "astro";
import { getDBFromEnv } from "../../../lib/db";
import { products } from "../../../lib/db/schema";
import { publishNotificationEvent, NOTIFICATION_EVENTS } from "../../../lib/notification";
import { eq, sql, count } from "drizzle-orm";
import { apiError, apiUnavailable, apiBadRequest, apiSuccess } from "../../../lib/api-response";
import { requireAdmin } from "../../../lib/auth-guard";
import { getEnv } from "../../../lib/env";
import { logger } from "../../../lib/logger";
import { createProductSchema, validateBody } from "../../../lib/validations";
import { slugify, ensureUniqueSlug } from "../../../lib/slug";

export const prerender = false;

// GET /api/products — List all products (optionally with pagination)
export const GET: APIRoute = async ({ url }) => {
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");

  try {
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1") || 1);
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20") || 20));
    const offset = (page - 1) * limit;
    const publishedOnly = url.searchParams.get("published") === "true";

    const whereCondition = publishedOnly ? eq(products.published, true) : undefined;

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
        createdAt: products.createdAt,
      }).from(products).where(whereCondition).orderBy(sql`${products.createdAt} desc`).limit(limit).offset(offset),
    ]);

    return new Response(
      JSON.stringify({ ok: true, data: { data: rows, total: countResult[0].total, page, limit } }),
      { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" } }
    );
  } catch (error) {
    return apiError(error);
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
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
    const RESERVED_SLUGS = ['page', 'other', 'all', 'index'];
    if (RESERVED_SLUGS.includes(slug)) {
      return apiBadRequest(`Slug "${slug}" is a reserved word and cannot be used`);
    }
    if (env.DB) slug = await ensureUniqueSlug(env.DB, "products", slug);
    const isPublished = published === true;
    await db.insert(products).values({ id, slug, name, summary: summary || null, description: description || null, published: isPublished, categoryId: categoryId || null });

    // Fire notification when product is published
    if (isPublished && env.DB) {
      publishNotificationEvent(
        { db: env.DB, env: env as Record<string, unknown> },
        {
          type: NOTIFICATION_EVENTS.PRODUCT_PUBLISHED,
          data: {
            productName: name,
            productUrl: `/products/${slug}`,
            summary: summary || undefined,
          },
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
