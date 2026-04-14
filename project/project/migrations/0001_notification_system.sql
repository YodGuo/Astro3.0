-- Migration: 0001_notification_system
-- Notification system tables: channels, subscriptions, logs, settings

-- ── Notification Channels ────────────────────────
CREATE TABLE IF NOT EXISTS `notification_channels` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `type` text NOT NULL,
  `config` text,
  `enabled` integer DEFAULT 1,
  `created_at` integer DEFAULT (unixepoch()) NOT NULL,
  `updated_at` integer DEFAULT (unixepoch()) NOT NULL
);

-- ── Notification Subscriptions ───────────────────
CREATE TABLE IF NOT EXISTS `notification_subscriptions` (
  `id` text PRIMARY KEY NOT NULL,
  `channel_id` text NOT NULL REFERENCES `notification_channels`(`id`) ON DELETE CASCADE,
  `event_type` text NOT NULL,
  `created_at` integer DEFAULT (unixepoch()) NOT NULL
);

-- ── Notification Logs ────────────────────────────
CREATE TABLE IF NOT EXISTS `notification_logs` (
  `id` text PRIMARY KEY NOT NULL,
  `event_type` text NOT NULL,
  `channel_id` text REFERENCES `notification_channels`(`id`),
  `channel_type` text NOT NULL,
  `status` text NOT NULL,
  `recipient` text,
  `error_message` text,
  `event_data` text,
  `created_at` integer DEFAULT (unixepoch()) NOT NULL
);

-- ── Notification Settings ────────────────────────
CREATE TABLE IF NOT EXISTS `notification_settings` (
  `key` text PRIMARY KEY NOT NULL,
  `value` text NOT NULL,
  `updated_at` integer DEFAULT (unixepoch()) NOT NULL
);

-- ── Indexes ──────────────────────────────────────
CREATE INDEX IF NOT EXISTS `idx_notification_subscriptions_channel` ON `notification_subscriptions`(`channel_id`);
CREATE INDEX IF NOT EXISTS `idx_notification_subscriptions_event` ON `notification_subscriptions`(`event_type`);
CREATE INDEX IF NOT EXISTS `idx_notification_logs_event` ON `notification_logs`(`event_type`);
CREATE INDEX IF NOT EXISTS `idx_notification_logs_status` ON `notification_logs`(`status`);
CREATE INDEX IF NOT EXISTS `idx_notification_logs_created` ON `notification_logs`(`created_at`);

-- ── Default Settings ─────────────────────────────
INSERT OR IGNORE INTO `notification_settings` (`key`, `value`) VALUES
  ('admin_channels', '{"email":true,"webhook":true}'),
  ('user_email', '{"enabled":true}');
