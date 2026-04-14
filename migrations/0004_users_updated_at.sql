-- Add updated_at column to users table (required by Better Auth)
-- NOTE: Wrangler D1 tracks applied migrations in _d1_migrations table,
-- so this file will never be re-executed by `wrangler d1 migrations apply`.
-- If running manually, ensure this hasn't been applied before.
ALTER TABLE `users` ADD COLUMN `updated_at` integer;
