import type { APIRoute } from "astro";
import { getDBFromEnv } from "../../../lib/db";
import { quoteRequests } from "../../../lib/db/schema";
import { eq } from "drizzle-orm";
import { publishNotificationEvent, NOTIFICATION_EVENTS } from "../../../lib/notification";
import { requireAdmin } from "../../../lib/auth-guard";
import { getEnv } from "../../../lib/env";
import { logger } from "../../../lib/logger";
import { apiError, apiUnavailable, apiBadRequest, apiNotFound, apiSuccess } from "../../../lib/api-response";

export const prerender = false;

const VALID_STATUSES = ["new", "contacted", "quoted", "closed"];

// GET /api/quote-requests/[id] — Get a single quote request
export const GET: APIRoute = async ({ params, locals }) => {
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

// PUT /api/quote-requests/[id] — Update a quote request (e.g., change status)
export const PUT: APIRoute = async ({ params, request, locals }) => {
  requireAdmin(locals);
  const { id } = params;
  if (!id) return apiBadRequest("Missing id");
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");

  try {
    const body = await request.json();
    const { status } = body as { status?: string };

    if (!status || !VALID_STATUSES.includes(status)) {
      return apiBadRequest(`status must be one of: ${VALID_STATUSES.join(", ")}`);
    }

    // Fetch existing quote
    const existing = await db
      .select()
      .from(quoteRequests)
      .where(eq(quoteRequests.id, id))
      .limit(1);

    if (existing.length === 0) {
      return apiNotFound("Quote request");
    }

    const quote = existing[0];

    // Update status
    await db
      .update(quoteRequests)
      .set({ status })
      .where(eq(quoteRequests.id, id));

    // Fire notification when status actually changes
    if (status !== quote.status && env.DB) {
      publishNotificationEvent(
        { db: env.DB, env: env as Record<string, unknown> },
        {
          type: NOTIFICATION_EVENTS.QUOTE_STATUS_CHANGED,
          data: {
            to: quote.email,
            quoteId: quote.id,
            newStatus: status,
            customerName: quote.name || "Customer",
          },
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
