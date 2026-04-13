globalThis.process ??= {};
globalThis.process.env ??= {};
import { g as getDBFromEnv, q as quoteRequests } from "./index_BdvyDh_N.mjs";
import { p as publishNotificationEvent } from "./notification.publisher_gE8ktshy.mjs";
import { N as NOTIFICATION_EVENTS } from "./template-engine_CUBCH2lW.mjs";
import { l as logger } from "./logger_CoNHAtH6.mjs";
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
import { v as validateBody, f as createQuoteRequestSchema } from "./validations_B2RLnuYh.mjs";
import { b as apiUnavailable, a as apiBadRequest, d as apiSuccess, e as apiError } from "./api-response_DQ3MgLJ0.mjs";
const prerender = false;
const POST = async ({ request }) => {
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");
  try {
    const parsedBody = await request.json();
    const { data, error: validationError } = validateBody(createQuoteRequestSchema, parsedBody);
    if (validationError || !data) return apiBadRequest(validationError || "Invalid request body");
    const { email, name, company, phone, product, message } = data;
    const id = crypto.randomUUID();
    await db.insert(quoteRequests).values({
      id,
      email,
      name: name || null,
      company: company || null,
      phone: phone || null,
      product: product || null,
      message,
      status: "new"
    });
    const adminEmail = env.ADMIN_EMAIL || "admin@yourcompany.com";
    const d1 = env.DB;
    if (d1) {
      publishNotificationEvent(
        { db: d1, env },
        {
          type: NOTIFICATION_EVENTS.QUOTE_CREATED,
          data: {
            to: adminEmail,
            quoteId: id,
            customerName: name || "Anonymous",
            customerEmail: email,
            company: company || void 0,
            product: product || void 0,
            message
          }
        }
      ).catch((err) => {
        logger.error("Failed to send notification", { context: "quote-create", error: String(err) });
      });
    }
    return apiSuccess({ id }, 201);
  } catch (error) {
    return apiError(error);
  }
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
