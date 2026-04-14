import type { APIRoute } from "astro";
import { z } from "zod";
import { d1All } from "../../../lib/db";
import { requireAdmin, AuthError } from "../../../lib/auth-guard";
import { getEnv } from "../../../lib/env";
import { apiError, apiUnavailable, apiBadRequest, apiSuccess, apiUnauthorized, apiForbidden } from "../../../lib/api-response";

export const prerender = false;

const subscriptionSchema = z.object({
  channelId: z.string().min(1),
  eventTypes: z.array(z.string()).min(1),
});

// GET /api/notifications/subscriptions?channelId=xxx — List subscriptions for a channel
export const GET: APIRoute = async ({ url, locals }) => {
  try {
    requireAdmin(locals);
  } catch (e) {
    if (e instanceof AuthError) {
      return e.status === 403 ? apiForbidden(e.message) : apiUnauthorized(e.message);
    }
    throw e;
  }

  const env = await getEnv();
  const d1 = env.DB;
  if (!d1) return apiUnavailable("DB not available");

  const channelId = url.searchParams.get("channelId");
  if (!channelId) {
    return apiBadRequest("channelId query parameter is required");
  }

  try {
    const result = await d1All<any>(d1, "SELECT * FROM notification_subscriptions WHERE channel_id = ?", channelId);

    return apiSuccess(result);
  } catch (e) {
    return apiError(e);
  }
};

// PUT /api/notifications/subscriptions — Set subscriptions for a channel (replaces all)
export const PUT: APIRoute = async ({ request, locals }) => {
  try {
    requireAdmin(locals);
  } catch (e) {
    if (e instanceof AuthError) {
      return e.status === 403 ? apiForbidden(e.message) : apiUnauthorized(e.message);
    }
    throw e;
  }

  const env = await getEnv();
  const d1 = env.DB;
  if (!d1) return apiUnavailable("DB not available");

  try {
    const body = await request.json();
    const parsed = subscriptionSchema.safeParse(body);
    if (!parsed.success) {
      return apiBadRequest(JSON.stringify(parsed.error.flatten()));
    }

    const { channelId, eventTypes } = parsed.data;

    // Delete existing subscriptions for this channel
    await d1.prepare("DELETE FROM notification_subscriptions WHERE channel_id = ?").bind(channelId).run();

    // Insert new subscriptions
    for (const eventType of eventTypes) {
      const id = crypto.randomUUID();
      await d1
        .prepare("INSERT INTO notification_subscriptions (id, channel_id, event_type) VALUES (?, ?, ?)")
        .bind(id, channelId, eventType)
        .run();
    }

    return apiSuccess({ success: true, channelId, eventTypes });
  } catch (e) {
    return apiError(e);
  }
};
