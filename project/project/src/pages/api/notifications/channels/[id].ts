import type { APIRoute } from "astro";
import { z } from "zod";
import { requireAdmin, AuthError } from "../../../../lib/auth-guard";
import { getEnv } from "../../../../lib/env";
import { apiError, apiUnavailable, apiBadRequest, apiNotFound, apiSuccess, apiUnauthorized, apiForbidden } from "../../../../lib/api-response";

export const prerender = false;

const updateChannelSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(["email", "webhook"]).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  enabled: z.boolean().optional(),
});

// GET /api/notifications/channels/[id] — Get a single channel
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    requireAdmin(locals);
  } catch (e) {
    if (e instanceof AuthError) {
      return e.status === 403 ? apiForbidden(e.message) : apiUnauthorized(e.message);
    }
    throw e;
  }

  const { id } = params;
  if (!id) return apiBadRequest("Missing id");
  const env = await getEnv();
  const d1 = env.DB;
  if (!d1) return apiUnavailable("DB not available");

  const result = await d1
    .prepare("SELECT * FROM notification_channels WHERE id = ?")
    .bind(id)
    .first() as Record<string, unknown> | null;

  if (!result) {
    return apiNotFound("Channel");
  }

  return apiSuccess({
    ...result,
    config: result.config ? JSON.parse(result.config) : {},
    enabled: result.enabled === 1,
  });
};

// PUT /api/notifications/channels/[id] — Update a channel
export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    requireAdmin(locals);
  } catch (e) {
    if (e instanceof AuthError) {
      return e.status === 403 ? apiForbidden(e.message) : apiUnauthorized(e.message);
    }
    throw e;
  }

  const { id } = params;
  if (!id) return apiBadRequest("Missing id");
  const env = await getEnv();
  const d1 = env.DB;
  if (!d1) return apiUnavailable("DB not available");

  try {
    const body = await request.json();
    const parsed = updateChannelSchema.safeParse(body);
    if (!parsed.success) {
      return apiBadRequest(JSON.stringify(parsed.error.flatten()));
    }

    const updates: string[] = [];
    const bindings: unknown[] = [];

    if (parsed.data.name !== undefined) { updates.push("name = ?"); bindings.push(parsed.data.name); }
    if (parsed.data.type !== undefined) { updates.push("type = ?"); bindings.push(parsed.data.type); }
    if (parsed.data.config !== undefined) { updates.push("config = ?"); bindings.push(JSON.stringify(parsed.data.config)); }
    if (parsed.data.enabled !== undefined) { updates.push("enabled = ?"); bindings.push(parsed.data.enabled ? 1 : 0); }

    if (updates.length === 0) {
      return apiBadRequest("No fields to update");
    }

    updates.push("updated_at = unixepoch()");
    bindings.push(id);

    await d1
      .prepare(`UPDATE notification_channels SET ${updates.join(", ")} WHERE id = ?`)
      .bind(...bindings)
      .run();

    return apiSuccess({ success: true });
  } catch (e) {
    return apiError(e);
  }
};

// DELETE /api/notifications/channels/[id] — Delete a channel (cascades to subscriptions)
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    requireAdmin(locals);
  } catch (e) {
    if (e instanceof AuthError) {
      return e.status === 403 ? apiForbidden(e.message) : apiUnauthorized(e.message);
    }
    throw e;
  }

  const { id } = params;
  if (!id) return apiBadRequest("Missing id");
  const env = await getEnv();
  const d1 = env.DB;
  if (!d1) return apiUnavailable("DB not available");

  try {
    await d1.prepare("DELETE FROM notification_channels WHERE id = ?").bind(id).run();
    return apiSuccess({ success: true });
  } catch (e) {
    return apiError(e);
  }
};
