import type { APIRoute } from "astro";
import { z } from "zod";
import { d1All } from "../../../lib/db";
import { requireAdmin, AuthError } from "../../../lib/auth-guard";
import { getEnv } from "../../../lib/env";
import { apiError, apiUnavailable, apiBadRequest, apiSuccess, apiUnauthorized, apiForbidden } from "../../../lib/api-response";

export const prerender = false;

const createChannelSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["email", "webhook"]),
  config: z.record(z.string(), z.unknown()).optional().default({}),
  enabled: z.boolean().optional().default(true),
});

// GET /api/notifications/channels — List all notification channels
export const GET: APIRoute = async ({ locals }) => {
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
    const result = await d1All<any>(d1,
      `SELECT nc.id, nc.name, nc.type, nc.config, nc.enabled, nc.created_at, nc.updated_at,
        GROUP_CONCAT(ns.event_type) as subscribed_events
       FROM notification_channels nc
       LEFT JOIN notification_subscriptions ns ON ns.channel_id = nc.id
       GROUP BY nc.id
       ORDER BY nc.created_at DESC`
    );

    const channels = result.map((r) => ({
      ...r,
      config: r.config ? JSON.parse(r.config) : {},
      enabled: r.enabled === 1,
      subscribedEvents: r.subscribed_events ? r.subscribed_events.split(",") : [],
    }));

    return apiSuccess(channels);
  } catch (e) {
    return apiError(e);
  }
};

// POST /api/notifications/channels — Create a notification channel
export const POST: APIRoute = async ({ request, locals }) => {
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
    const parsed = createChannelSchema.safeParse(body);
    if (!parsed.success) {
      return apiBadRequest(JSON.stringify(parsed.error.flatten()));
    }

    const { name, type, config, enabled } = parsed.data;
    const id = crypto.randomUUID();

    await d1
      .prepare(
        `INSERT INTO notification_channels (id, name, type, config, enabled) VALUES (?, ?, ?, ?, ?)`
      )
      .bind(id, name, type, JSON.stringify(config), enabled ? 1 : 0)
      .run();

    return apiSuccess({ id, name, type, config, enabled }, 201);
  } catch (e) {
    return apiError(e);
  }
};
