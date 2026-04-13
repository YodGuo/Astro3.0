-- ── Global Rate Limiting (EDGE-02) ───────────────
-- Replaces per-isolate in-memory Map with D1-backed rate limiting.
-- Works across all Cloudflare Worker isolates.

CREATE TABLE IF NOT EXISTS `rate_limits` (
  `id` TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  `bucket_key` TEXT NOT NULL,
  `request_count` INTEGER NOT NULL DEFAULT 1,
  `window_start` INTEGER NOT NULL,
  `window_end` INTEGER NOT NULL,
  `created_at` TEXT DEFAULT (datetime('now'))
);

-- Composite index for bucket lookups + cleanup
CREATE INDEX IF NOT EXISTS `idx_rate_limits_bucket`
  ON `rate_limits`(`bucket_key`, `window_end`);

-- Periodic cleanup: delete expired entries (older than 1 hour)
-- This is handled by the rate-limit-d1.ts module on each check.
