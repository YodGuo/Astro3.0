import type { NotificationContext } from "./queue-consumer";
import { getNotificationSetting } from "./settings-cache";

// ── Rate Limit Config ────────────────────────────

export interface RateLimitConfig {
  /** Time window in seconds (default: 300 = 5 minutes) */
  windowSeconds: number;
  /** Whether rate limiting is enabled (default: true) */
  enabled: boolean;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowSeconds: 300,
  enabled: true,
};

// ── Load Config from DB ──────────────────────────

async function getRateLimitConfig(ctx: NotificationContext): Promise<RateLimitConfig> {
  try {
    const config = await getNotificationSetting(ctx, 'rate_limit');
    if (!config) return DEFAULT_CONFIG;
    return {
      windowSeconds: typeof config.windowSeconds === "number" ? config.windowSeconds : DEFAULT_CONFIG.windowSeconds,
      enabled: config.enabled !== false,
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

// ── Check Rate Limit ─────────────────────────────

/**
 * Check if a notification should be rate-limited (deduplicated).
 *
 * Deduplication key: event_type + channel_id + recipient
 * If a "sent" log exists within the time window, returns true (should skip).
 *
 * @returns true if the notification should be skipped (rate limited)
 */
export async function isRateLimited(
  ctx: NotificationContext,
  params: {
    eventType: string;
    channelId: string;
    recipient?: string;
  }
): Promise<boolean> {
  const config = await getRateLimitConfig(ctx);
  if (!config.enabled) return false;

  const cutoff = Math.floor(Date.now() / 1000) - config.windowSeconds;

  // Check for recent "sent" notifications with the same dedup key
  const row = await ctx.db
    .prepare(
      `SELECT COUNT(*) as cnt FROM notification_logs
       WHERE event_type = ?
         AND channel_id = ?
         AND recipient = ?
         AND status = 'sent'
         AND created_at > ?`
    )
    .bind(
      params.eventType,
      params.channelId,
      params.recipient ?? "",
      cutoff
    )
    .first() as { cnt: number } | null;

  return (row?.cnt ?? 0) > 0;
}

/**
 * Get the current rate limit configuration for display purposes.
 */
export async function getRateLimitSettings(ctx: NotificationContext): Promise<RateLimitConfig> {
  return getRateLimitConfig(ctx);
}
