import type { APIRoute } from "astro";
import { ALL_SUBSCRIBABLE_EVENTS } from "../../../lib/notification/notification.schema";
import { templateKey, getAvailableVariables } from "../../../lib/notification/template-engine";
import { d1All } from "../../../lib/db";
import { requireAdmin, AuthError } from "../../../lib/auth-guard";
import { getEnv } from "../../../lib/env";
import { apiError, apiUnavailable, apiBadRequest, apiSuccess, apiUnauthorized, apiForbidden } from "../../../lib/api-response";
import { z } from "zod";

// Zod schema for template update validation
const updateTemplateSchema = z.object({
  eventType: z.string().min(1),
  subject: z.string().max(500).optional().nullable(),
  body: z.string().max(10000).optional().nullable(),
  title: z.string().max(200).optional().nullable(),
  text: z.string().max(5000).optional().nullable(),
});

export const prerender = false;

// GET /api/notifications/templates — List all templates (with available variables)
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
    const result = await d1All<{ key: string; value: string; updated_at: number }>(d1,
      "SELECT key, value, updated_at FROM notification_settings WHERE key LIKE 'template:%'"
    );

    const templates = result.map((row) => {
      let parsed: Record<string, unknown> = {};
      try { parsed = JSON.parse(row.value); } catch { /* ignore */ }
      return {
        eventType: row.key.replace("template:", ""),
        subject: (parsed.subject as string) || null,
        body: (parsed.body as string) || null,
        title: (parsed.title as string) || null,
        text: (parsed.text as string) || null,
        variables: getAvailableVariables(row.key.replace("template:", "")),
        updatedAt: row.updated_at ?? 0,
      };
    });

    // Include event types that don't have custom templates yet
    const existingTypes = new Set(templates.map((t) => t.eventType));
    for (const eventType of ALL_SUBSCRIBABLE_EVENTS) {
      if (!existingTypes.has(eventType)) {
        templates.push({
          eventType,
          subject: null,
          body: null,
          title: null,
          text: null,
          variables: getAvailableVariables(eventType),
          updatedAt: 0,
        });
      }
    }

    return apiSuccess(templates);
  } catch (e) {
    return apiError(e);
  }
};

// PUT /api/notifications/templates — Save a template for an event type
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
    const raw = await request.json();
    const parsed = updateTemplateSchema.safeParse(raw);
    if (!parsed.success) {
      return apiBadRequest(parsed.error.issues.map(i => i.message).join("; "));
    }
    const body = parsed.data;

    if (!(ALL_SUBSCRIBABLE_EVENTS as readonly string[]).includes(body.eventType)) {
      return apiBadRequest(`Invalid event type. Must be one of: ${ALL_SUBSCRIBABLE_EVENTS.join(", ")}`);
    }

    const key = templateKey(body.eventType);
    const value = JSON.stringify({
      subject: body.subject || null,
      body: body.body || null,
      title: body.title || null,
      text: body.text || null,
    });

    await d1
      .prepare(
        `INSERT INTO notification_settings (key, value, updated_at) VALUES (?, ?, unixepoch())
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = unixepoch()`
      )
      .bind(key, value)
      .run();

    return apiSuccess({ success: true, eventType: body.eventType });
  } catch (e) {
    return apiError(e);
  }
};

// DELETE /api/notifications/templates?eventType=xxx — Reset a template to default
export const DELETE: APIRoute = async ({ url, locals }) => {
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

  const eventType = url.searchParams.get("eventType");
  if (!eventType) {
    return apiBadRequest("eventType query parameter is required");
  }

  try {
    const key = templateKey(eventType);
    await d1.prepare("DELETE FROM notification_settings WHERE key = ?").bind(key).run();
    return apiSuccess({ success: true, eventType });
  } catch (e) {
    return apiError(e);
  }
};
