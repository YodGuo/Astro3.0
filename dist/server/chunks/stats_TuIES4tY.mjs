globalThis.process ??= {};
globalThis.process.env ??= {};
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
import { r as requireAdmin, A as AuthError } from "./auth-guard_B5bfjxXB.mjs";
import { g as apiForbidden, f as apiUnauthorized, b as apiUnavailable, d as apiSuccess, e as apiError } from "./api-response_DQ3MgLJ0.mjs";
const prerender = false;
const GET = async ({ url, locals }) => {
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
    const overall = await d1.prepare(
      `SELECT
           COUNT(*) as total,
           SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
           SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
           SUM(CASE WHEN status = 'skipped' THEN 1 ELSE 0 END) as skipped
         FROM notification_logs
         WHERE created_at > ?`
    ).bind(cutoff).first();
    const total = overall?.total ?? 0;
    const sent = overall?.sent ?? 0;
    const failed = overall?.failed ?? 0;
    const skipped = overall?.skipped ?? 0;
    const byEventRaw = await d1.prepare(
      `SELECT event_type, status, COUNT(*) as cnt
         FROM notification_logs
         WHERE created_at > ?
         GROUP BY event_type, status
         ORDER BY event_type`
    ).bind(cutoff).all();
    const byEvent = Array.isArray(byEventRaw) ? byEventRaw : byEventRaw.results || [];
    const byChannelRaw = await d1.prepare(
      `SELECT channel_type, status, COUNT(*) as cnt
         FROM notification_logs
         WHERE created_at > ?
         GROUP BY channel_type, status
         ORDER BY channel_type`
    ).bind(cutoff).all();
    const byChannel = Array.isArray(byChannelRaw) ? byChannelRaw : byChannelRaw.results || [];
    const days = period === "all" ? 30 : parseDays(period);
    const dailyRaw = await d1.prepare(
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
    ).bind(cutoff, days).all();
    const daily = Array.isArray(dailyRaw) ? dailyRaw : dailyRaw.results || [];
    const topFailedRaw = await d1.prepare(
      `SELECT event_type, COUNT(*) as cnt
         FROM notification_logs
         WHERE status = 'failed' AND created_at > ?
         GROUP BY event_type
         ORDER BY cnt DESC
         LIMIT 5`
    ).bind(cutoff).all();
    const topFailed = Array.isArray(topFailedRaw) ? topFailedRaw : topFailedRaw.results || [];
    return apiSuccess({
      period,
      total,
      sent,
      failed,
      skipped,
      successRate: total > 0 ? Math.round(sent / total * 100) : 100,
      failureRate: total > 0 ? Math.round(failed / total * 100) : 0,
      skipRate: total > 0 ? Math.round(skipped / total * 100) : 0,
      byEvent: groupByField(byEvent, "event_type"),
      byChannel: groupByField(byChannel, "channel_type"),
      daily: [...daily].reverse(),
      // chronological order
      topFailed
    });
  } catch (e) {
    return apiError(e);
  }
};
function groupByField(rows, field) {
  const result = {};
  for (const row of rows) {
    const key = String(row[field]);
    if (!result[key]) result[key] = { sent: 0, failed: 0, skipped: 0 };
    if (row.status === "sent") result[key].sent += row.cnt;
    else if (row.status === "failed") result[key].failed += row.cnt;
    else if (row.status === "skipped") result[key].skipped += row.cnt;
  }
  return result;
}
function parseDays(period) {
  const match = period.match(/^(\d+)d$/);
  return match ? parseInt(match[1]) : 7;
}
function getCutoffSeconds(period) {
  if (period === "all") return 0;
  const days = parseDays(period);
  return Math.floor(Date.now() / 1e3) - days * 86400;
}
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
