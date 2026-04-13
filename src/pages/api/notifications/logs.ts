import type { APIRoute } from "astro";
import { d1All } from "../../../lib/db";
import { getEnv } from "../../../lib/env";
import { requireAdmin, AuthError } from "../../../lib/auth-guard";
import { apiError, apiUnavailable, apiSuccess, apiUnauthorized, apiForbidden } from "../../../lib/api-response";

export const prerender = false;

// GET /api/notifications/logs?eventType=xxx&status=xxx&limit=50&offset=0
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

  try {
    const eventType = url.searchParams.get("eventType");
    const status = url.searchParams.get("status");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);
    const offset = parseInt(url.searchParams.get("offset") || "0");

    let query = "SELECT * FROM notification_logs";
    const conditions: string[] = [];
    const bindings: unknown[] = [];

    if (eventType) {
      conditions.push("event_type = ?");
      bindings.push(eventType);
    }
    if (status) {
      conditions.push("status = ?");
      bindings.push(status);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    bindings.push(limit, offset);

    const result = await d1All<any>(d1, query, ...bindings);

    const logs = result.map((r) => ({
      ...r,
      eventData: r.event_data ? JSON.parse(r.event_data) : null,
    }));

    return apiSuccess(logs);
  } catch (e) {
    return apiError(e);
  }
};
