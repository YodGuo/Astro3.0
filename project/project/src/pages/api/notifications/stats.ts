import type { APIRoute } from "astro";
import { getEnv } from "../../../lib/env";
import { requireAdmin, AuthError } from "../../../lib/auth-guard";
import { apiError, apiUnavailable, apiSuccess, apiUnauthorized, apiForbidden } from "../../../lib/api-response";

export const prerender = false;

// GET /api/notifications/stats?period=7d
// period: 7d (default), 30d, 90d, all
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
    const period = url.searchParams.get("period") || "7d";
    const cutoff = getCutoffSeconds(period);

    // ── Overall stats ──
    const overall = await d1
      .prepare(
        `SELECT
           COUNT(*) as total,
           SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
           SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
           SUM(CASE WHEN status = 'skipped' THEN 1 ELSE 0 END) as skipped
         FROM notification_logs
         WHERE created_at > ?`
      )
      .bind(cutoff)
      .first() as { total: number; sent: number; failed: number; skipped: number } | null;

    const total = overall?.total ?? 0;
    const sent = overall?.sent ?? 0;
    const failed = overall?.failed ?? 0;
    const skipped = overall?.skipped ?? 0;

    // ── By event type ──
    const byEventRaw = await d1
      .prepare(
        `SELECT event_type, status, COUNT(*) as cnt
         FROM notification_logs
         WHERE created_at > ?
         GROUP BY event_type, status
         ORDER BY event_type`
      )
      .bind(cutoff)
      .all();
    const byEvent = (Array.isArray(byEventRaw) ? byEventRaw : (byEventRaw as { results?: unknown[] }).results || []) as { event_type: string; status: string; cnt: number }[];

    // ── By channel type ──
    const byChannelRaw = await d1
      .prepare(
        `SELECT channel_type, status, COUNT(*) as cnt
         FROM notification_logs
         WHERE created_at > ?
         GROUP BY channel_type, status
         ORDER BY channel_type`
      )
      .bind(cutoff)
      .all();
    const byChannel = (Array.isArray(byChannelRaw) ? byChannelRaw : (byChannelRaw as { results?: unknown[] }).results || []) as { channel_type: string; status: string; cnt: number }[];

    // ── Daily trend (last N days) ──
    const days = period === "all" ? 30 : parseDays(period);
    const dailyRaw = await d1
      .prepare(
        `SELECT
           date(created_at, 'unixepoch') as date,
           SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
           SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
           SUM(CASE WHEN status = 'skipped' THEN 1 ELSE 0 END) as skipped
         FROM notification_logs
         WHERE created_at > ?
         GROUP BY date(created_at, 'unixepoch')
         ORDER BY date DESC
         LIMIT ?`
      )
      .bind(cutoff, days)
      .all();
    const daily = (Array.isArray(dailyRaw) ? dailyRaw : (dailyRaw as { results?: unknown[] }).results || []) as { date: string; sent: number; failed: number; skipped: number }[];

    // ── Top failed event types ──
    const topFailedRaw = await d1
      .prepare(
        `SELECT event_type, COUNT(*) as cnt
         FROM notification_logs
         WHERE status = 'failed' AND created_at > ?
         GROUP BY event_type
         ORDER BY cnt DESC
         LIMIT 5`
      )
      .bind(cutoff)
      .all();
    const topFailed = (Array.isArray(topFailedRaw) ? topFailedRaw : (topFailedRaw as { results?: unknown[] }).results || []) as { event_type: string; cnt: number }[];

    return apiSuccess({
      period,
      total,
      sent,
      failed,
      skipped,
      successRate: total > 0 ? Math.round((sent / total) * 100) : 100,
      failureRate: total > 0 ? Math.round((failed / total) * 100) : 0,
      skipRate: total > 0 ? Math.round((skipped / total) * 100) : 0,
      byEvent: groupByField(byEvent, "event_type"),
      byChannel: groupByField(byChannel, "channel_type"),
      daily: [...daily].reverse(), // chronological order
      topFailed,
    });
  } catch (e) {
    return apiError(e);
  }
};

function groupByField(
  rows: { [key: string]: string | number; cnt: number }[],
  field: string
): Record<string, { sent: number; failed: number; skipped: number }> {
  const result: Record<string, { sent: number; failed: number; skipped: number }> = {};
  for (const row of rows) {
    const key = String(row[field]);
    if (!result[key]) result[key] = { sent: 0, failed: 0, skipped: 0 };
    if (row.status === "sent") result[key].sent += row.cnt;
    else if (row.status === "failed") result[key].failed += row.cnt;
    else if (row.status === "skipped") result[key].skipped += row.cnt;
  }
  return result;
}

function parseDays(period: string): number {
  const match = period.match(/^(\d+)d$/);
  return match ? parseInt(match[1]) : 7;
}

function getCutoffSeconds(period: string): number {
  if (period === "all") return 0;
  const days = parseDays(period);
  return Math.floor(Date.now() / 1000) - (days * 86400);
}
