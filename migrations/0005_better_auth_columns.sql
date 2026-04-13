-- Add missing columns required by Better Auth
-- sessions: ip_address, updated_at
-- NOTE: Wrangler D1 tracks applied migrations, so this file won't be re-executed.
ALTER TABLE `sessions` ADD COLUMN `ip_address` text;
ALTER TABLE `sessions` ADD COLUMN `updated_at` integer;

-- accounts: updated_at (if missing)
-- (accounts table may already have it from migration 0000)
