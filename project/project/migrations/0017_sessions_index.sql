-- ── Sessions Composite Index (DB-01) ────────────
-- Better Auth frequently queries: WHERE user_id = ? AND expires_at > ?
-- This composite index covers the most common session lookup pattern.

CREATE INDEX IF NOT EXISTS `idx_sessions_user_id_expires`
  ON `sessions`(`user_id`, `expires_at`);
