import type { APIRoute } from "astro";
import { getEnv } from "../../../lib/env";
import { requireAdmin, AuthError } from "../../../lib/auth-guard";
import { apiError, apiUnavailable, apiSuccess, apiUnauthorized, apiForbidden } from "../../../lib/api-response";

interface NotificationRow {
  id: string;
  event_type: string;
  event_data: string | null;
  status: string;
  channel_type: string;
  recipient: string;
  error_message: string | null;
  created_at: string;
}

export const prerender = false;

// GET /api/notifications/latest — Get latest notifications for polling fallback
// Supports incremental polling via ?since=<logId> query parameter.
// When 'since' is provided, only returns notifications created after that log entry.
export const GET: APIRoute = async ({ locals, url }) => {
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
    const sinceId = url.searchParams.get("since");

    let query: string;
    let bindings: unknown[] = [];

    if (sinceId) {
      // Incremental: fetch notifications created after the given logId
      // Uses created_at comparison for reliable ordering
      query = `
        SELECT n.* FROM notification_logs n
        INNER JOIN (
          SELECT created_at FROM notification_logs WHERE id = ?
        ) ref ON n.created_at > ref.created_at OR (n.created_at = ref.created_at AND n.id > ?)
        ORDER BY n.created_at ASC, n.id ASC
        LIMIT 20
      `;
      bindings = [sinceId, sinceId];
    } else {
      // Initial load: get latest 5 notifications
      query = "SELECT * FROM notification_logs ORDER BY created_at DESC LIMIT 5";
    }

    const stmt = d1.prepare(query);
    const result = bindings.length > 0
      ? await stmt.bind(...bindings as string[]).all()
      : await stmt.all();
    const rows = (result.results || []) as NotificationRow[];

    const notifications = rows.map((r) => {
      const eventData = r.event_data ? JSON.parse(r.event_data) : null;
      return {
        eventType: r.event_type,
        data: eventData,
        logId: r.id,
        status: r.status,
        channelType: r.channel_type,
        recipient: r.recipient,
        errorMessage: r.error_message,
        createdAt: r.created_at
      };
    });

    const response = apiSuccess(notifications);
    // Preserve Cache-Control header for polling
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    return response;
  } catch (e) {
    return apiError(e);
  }
};
