import type { APIRoute } from "astro";
import { getDBFromEnv } from "../../../lib/db";
import { products } from "../../../lib/db/schema";
import { eq } from "drizzle-orm";
import { publishNotificationEvent, NOTIFICATION_EVENTS } from "../../../lib/notification";
import { apiError, apiUnavailable, apiBadRequest, apiNotFound, apiSuccess } from "../../../lib/api-response";
import { requireAdmin } from "../../../lib/auth-guard";
import { updateProductSchema, validateBody } from "../../../lib/validations";
import { getEnv } from "../../../lib/env";
import { logger } from "../../../lib/logger";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const { id } = params;
  if (!id) return apiBadRequest("Missing id");
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");
  const rows = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (rows.length === 0) return apiNotFound("Product");
  return apiSuccess(rows[0]);
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
  requireAdmin(locals);
  const { id } = params;
  if (!id) return apiBadRequest("Missing id");
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");
  try {
    const raw = await request.json();
    const validation = validateBody(updateProductSchema, raw);
    if (validation.error) return apiBadRequest(validation.error);
    const body = validation.data;

    // Check if transitioning to published (fire notification)
    const shouldNotify = body.published === true;
    if (shouldNotify && env.DB) {
      const existing = await db.select({ published: products.published, name: products.name, slug: products.slug }).from(products).where(eq(products.id, id)).limit(1);
      if (existing.length > 0 && !existing[0].published) {
        const product = existing[0];
        publishNotificationEvent(
          { db: env.DB, env: env as Record<string, unknown> },
          {
            type: NOTIFICATION_EVENTS.PRODUCT_PUBLISHED,
            data: {
              productName: (body.name as string) || product.name,
              productUrl: `/products/${product.slug}`,
              summary: (body.summary as string) || undefined,
            },
          }
        ).catch((err) => {
          logger.error("Failed to send notification", { context: "product-update", error: String(err) });
        });
      }
    }

    await db.update(products).set({ name: (body.name as string) ?? undefined, summary: (body.summary as string) ?? undefined, description: (body.description as string) ?? undefined, published: body.published as boolean | undefined }).where(eq(products.id, id));
    return apiSuccess({ ok: true });
  } catch (error) {
    return apiError(error);
  }
};
