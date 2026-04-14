import type { APIRoute } from "astro";
import { getDBFromEnv } from "../../../lib/db";
import { quoteRequests } from "../../../lib/db/schema";
import { publishNotificationEvent, NOTIFICATION_EVENTS } from "../../../lib/notification";
import { getEnv } from "../../../lib/env";
import { logger } from "../../../lib/logger";
import { createQuoteRequestSchema, validateBody } from "../../../lib/validations";
import { apiError, apiUnavailable, apiBadRequest, apiSuccess } from "../../../lib/api-response";

export const prerender = false;

// POST /api/quote-requests — Create a new quote/inquiry request
export const POST: APIRoute = async ({ request }) => {
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
      status: "new",
    });

    // Fire notification (non-blocking, errors are logged but don't fail the request)
    const adminEmail = env.ADMIN_EMAIL || "admin@yourcompany.com";
    const d1 = env.DB;
    if (d1) {
      publishNotificationEvent(
        { db: d1, env: env as Record<string, unknown> },
        {
          type: NOTIFICATION_EVENTS.QUOTE_CREATED,
          data: {
            to: adminEmail,
            quoteId: id,
            customerName: name || "Anonymous",
            customerEmail: email,
            company: company || undefined,
            product: product || undefined,
            message,
          },
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
