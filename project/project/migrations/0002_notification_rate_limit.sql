-- ── Notification Rate Limiting ───────────────────
-- Add composite index for rate limit queries:
--   SELECT COUNT(*) FROM notification_logs
--   WHERE event_type = ? AND channel_id = ? AND recipient = ?
--     AND status = 'sent' AND created_at > ?

CREATE INDEX IF NOT EXISTS `idx_notification_logs_dedup`
  ON `notification_logs`(`event_type`, `channel_id`, `recipient`, `status`, `created_at`);

-- ── Default Rate Limit Setting ───────────────────
-- 300 seconds (5 minutes) window, enabled by default.
-- Set to {"enabled": false} to disable rate limiting.
-- Set to {"windowSeconds": 60} for a 1-minute window.

INSERT OR IGNORE INTO `notification_settings` (`key`, `value`) VALUES
  ('rate_limit', '{"enabled":true,"windowSeconds":300}');
