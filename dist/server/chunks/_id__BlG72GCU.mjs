globalThis.process ??= {};
globalThis.process.env ??= {};
import { g as getDBFromEnv, q as quoteRequests, e as eq } from "./index_BdvyDh_N.mjs";
import { p as publishNotificationEvent } from "./notification.publisher_gE8ktshy.mjs";
import { N as NOTIFICATION_EVENTS } from "./template-engine_CUBCH2lW.mjs";
import { l as logger } from "./logger_CoNHAtH6.mjs";
import { r as requireAdmin } from "./auth-guard_B5bfjxXB.mjs";
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
import { a as apiBadRequest, b as apiUnavailable, c as apiNotFound, d as apiSuccess, e as apiError } from "./api-response_DQ3MgLJ0.mjs";
const prerender = false;
const VALID_STATUSES = ["new", "contacted", "quoted", "closed"];
const GET = async ({ params, locals }) => {
  requireAdmin(locals);
  const { id } = params;
  if (!id) return apiBadRequest("Missing id");
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");
  try {
    const rows = await db.select().from(quoteRequests).where(eq(quoteRequests.id, id)).limit(1);
    if (rows.length === 0) {
      return apiNotFound("Quote request");
    }
    return apiSuccess(rows[0]);
  } catch (error) {
    return apiError(error);
  }
};
const PUT = async ({ params, request, locals }) => {
  requireAdmin(locals);
  const { id } = params;
  if (!id) return apiBadRequest("Missing id");
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");
  try {
    const body = await request.json();
    const { status } = body;
    if (!status || !VALID_STATUSES.includes(status)) {
      return apiBadRequest(`status must be one of: ${VALID_STATUSES.join(", ")}`);
    }
    const existing = await db.select().from(quoteRequests).where(eq(quoteRequests.id, id)).limit(1);
    if (existing.length === 0) {
      return apiNotFound("Quote request");
    }
    const quote = existing[0];
    await db.update(quoteRequests).set({ status }).where(eq(quoteRequests.id, id));
    if (status !== quote.status && env.DB) {
      publishNotificationEvent(
        { db: env.DB, env },
        {
          type: NOTIFICATION_EVENTS.QUOTE_STATUS_CHANGED,
          data: {
            to: quote.email,
            quoteId: quote.id,
            newStatus: status,
            customerName: quote.name || "Customer"
          }
        }
      ).catch((err) => {
        logger.error("Failed to send notification", { context: "quote-status-change", error: String(err) });
      });
    }
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
