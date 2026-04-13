/**
 * D1-backed rate limiter for Cloudflare Workers.
 *
 * Replaces the per-isolate in-memory Map with D1 database storage,
 * providing global rate limiting across all Worker isolates.
 *
 * Strategy: Fixed-window counter per bucket_key.
 * - bucket_key = "{ip}:{pathPrefix}" (e.g., "1.2.3.4:/api/auth/sign-in")
 * - Each row represents one fixed window (window_start .. window_end)
 * - On each request: find or create the current window row, check count
 *
 * Cleanup: Expired rows (>1 hour old) are deleted periodically.
 */

import type { RateLimitRule, RateLimitResult } from "./rate-limit";

// ── Cleanup ────────────────────────────────────────

let lastCleanup = 0;
const CLEANUP_INTERVAL_MS = 60_000; // 1 minute

async function cleanupExpired(d1: D1Database): Promise<void> {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  try {
    await d1
      .prepare("DELETE FROM rate_limits WHERE window_end < ?")
      .bind(Math.floor(now / 1000) - 3600) // delete entries older than 1 hour
      .run();
  } catch {
    // Cleanup is best-effort
  }
}

// ── Core Function ─────────────────────────────────

/**
 * Check rate limit using D1 (global, cross-isolate).
 *
 * @param d1 - D1 database instance
 * @param key - Unique bucket key (e.g., "1.2.3.4:/api/auth/sign-in")
 * @param rule - Rate limit configuration
 * @returns RateLimitResult with allowed status and metadata
 */
export async function checkRateLimitD1(
  d1: D1Database,
  key: string,
  rule: RateLimitRule
): Promise<RateLimitResult> {
  await cleanupExpired(d1);

  const now = Math.floor(Date.now() / 1000);
  const windowSeconds = rule.windowSeconds;
  const windowStart = now - (now % windowSeconds); // align to window boundary
  const windowEnd = windowStart + windowSeconds;

  // Find existing window row for this bucket
  const existing = await d1
    .prepare(
      "SELECT request_count FROM rate_limits WHERE bucket_key = ? AND window_start = ? AND window_end = ?"
    )
    .bind(key, windowStart, windowEnd)
    .first() as { request_count: number } | null;

  if (existing) {
    if (existing.request_count >= rule.maxRequests) {
      const resetAfter = windowEnd - now;
      return {
        allowed: false,
        remaining: 0,
        resetAfter: Math.max(resetAfter, 1),
      };
    }

    // Increment count
    await d1
      .prepare(
        "UPDATE rate_limits SET request_count = request_count + 1 WHERE bucket_key = ? AND window_start = ?"
      )
      .bind(key, windowStart)
      .run();

    return {
      allowed: true,
      remaining: rule.maxRequests - existing.request_count - 1,
      resetAfter: windowEnd - now,
    };
  }

  // No existing window — create new row (first request in this window)
  await d1
    .prepare(
      "INSERT INTO rate_limits (bucket_key, request_count, window_start, window_end) VALUES (?, 1, ?, ?)"
    )
    .bind(key, windowStart, windowEnd)
    .run();

  return {
    allowed: true,
    remaining: rule.maxRequests - 1,
    resetAfter: windowEnd - now,
  };
}
