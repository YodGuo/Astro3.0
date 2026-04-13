-- Add user_agent column to sessions (required by Better Auth)
-- NOTE: Wrangler D1 tracks applied migrations, so this file won't be re-executed.
ALTER TABLE `sessions` ADD COLUMN `user_agent` text;
