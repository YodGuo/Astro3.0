/**
 * In-memory rate limiter for Cloudflare Workers (FALLBACK).
 *
 * Uses a sliding-window counter per IP. No external store required —
 * the Map lives within a single Worker isolate and is automatically
 * garbage-collected when entries expire.
 *
 * NOTE: This is now used as a fallback when D1 is unavailable.
 * The primary rate limiter is rate-limit-d1.ts (D1-backed, global).
 * For production-grade global rate limiting, also consider configuring
 * Cloudflare WAF Rate Limiting rules in the dashboard as an additional layer.
 */

// ── Types ──────────────────────────────────────────

export interface RateLimitRule {
  /** Maximum number of requests allowed within the window */
  maxRequests: number;
  /** Time window in seconds */
  windowSeconds: number;
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Remaining requests in the current window */
  remaining: number;
  /** Seconds until the window resets */
  resetAfter: number;
}

// ── Storage ────────────────────────────────────────

// Map<key, number[]> where values are timestamps of recent requests
const store = new Map<string, number[]>();

// ── Cleanup ────────────────────────────────────────

// Periodically purge stale entries to prevent memory leaks.
// Runs every 60 seconds.
const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = 0;

function cleanup(now: number): void {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, timestamps] of store) {
    // Keep only timestamps within the longest configured window (300s)
    const cutoff = now - 300_000;
    const filtered = timestamps.filter((ts) => ts > cutoff);
    if (filtered.length === 0) {
      store.delete(key);
    } else {
      store.set(key, filtered);
    }
  }
}

// ── Core Function ─────────────────────────────────

/**
 * Check if a request should be rate-limited.
 *
 * @param key - Unique identifier for the rate limit bucket (e.g. "ip:1.2.3.4:endpoint")
 * @param rule - Rate limit configuration
 * @returns RateLimitResult with allowed status and metadata
 */
export function checkRateLimit(key: string, rule: RateLimitRule): RateLimitResult {
  const now = Date.now();
  cleanup(now);

  const windowMs = rule.windowSeconds * 1000;
  const cutoff = now - windowMs;

  let timestamps = store.get(key);

  if (!timestamps) {
    timestamps = [];
    store.set(key, timestamps);
  }

  // Filter to only requests within the current window
  const recent = timestamps.filter((ts) => ts > cutoff);
  store.set(key, recent);

  if (recent.length >= rule.maxRequests) {
    // Find when the oldest request in the window expires
    const oldestInWindow = recent[0];
    const resetAfter = Math.ceil((oldestInWindow + windowMs - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetAfter: Math.max(resetAfter, 1),
    };
  }

  // Record this request
  recent.push(now);
  store.set(key, recent);

  return {
    allowed: true,
    remaining: rule.maxRequests - recent.length,
    resetAfter: rule.windowSeconds,
  };
}

/**
 * Extract client IP from request headers.
 * Checks CF-Connecting-IP (Cloudflare) → X-Forwarded-For → fallback.
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}
