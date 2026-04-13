globalThis.process ??= {};
globalThis.process.env ??= {};
import { g as getDBFromEnv, h as products, e as eq } from "./index_BdvyDh_N.mjs";
import { p as publishNotificationEvent } from "./notification.publisher_gE8ktshy.mjs";
import { N as NOTIFICATION_EVENTS } from "./template-engine_CUBCH2lW.mjs";
import { l as logger } from "./logger_CoNHAtH6.mjs";
import { a as apiBadRequest, b as apiUnavailable, c as apiNotFound, d as apiSuccess, e as apiError } from "./api-response_DQ3MgLJ0.mjs";
import { r as requireAdmin } from "./auth-guard_B5bfjxXB.mjs";
import { v as validateBody, d as updateProductSchema } from "./validations_B2RLnuYh.mjs";
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
const prerender = false;
const GET = async ({ params }) => {
  const { id } = params;
  if (!id) return apiBadRequest("Missing id");
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");
  const rows = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (rows.length === 0) return apiNotFound("Product");
  return apiSuccess(rows[0]);
};
const PUT = async ({ params, request, locals }) => {
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
    const shouldNotify = body.published === true;
    if (shouldNotify && env.DB) {
      const existing = await db.select({ published: products.published, name: products.name, slug: products.slug }).from(products).where(eq(products.id, id)).limit(1);
      if (existing.length > 0 && !existing[0].published) {
        const product = existing[0];
        publishNotificationEvent(
          { db: env.DB, env },
          {
            type: NOTIFICATION_EVENTS.PRODUCT_PUBLISHED,
            data: {
              productName: body.name || product.name,
              productUrl: `/products/${product.slug}`,
              summary: body.summary || void 0
            }
          }
        ).catch((err) => {
          logger.error("Failed to send notification", { context: "product-update", error: String(err) });
        });
      }
    }
    await db.update(products).set({ name: body.name ?? void 0, summary: body.summary ?? void 0, description: body.description ?? void 0, published: body.published }).where(eq(products.id, id));
    return apiSuccess({ ok: true });
  } catch (error) {
    return apiError(error);
  }
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET,
  PUT,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
