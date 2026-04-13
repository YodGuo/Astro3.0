-- Migration: 0000_initial_schema
-- Generated from src/lib/db/schema/index.ts
-- Run: npx wrangler d1 execute my-b2b-db --file=./migrations/0000_initial_schema.sql

-- ── Users (managed by Better Auth) ──────────────
CREATE TABLE IF NOT EXISTS `users` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text,
  `email` text NOT NULL UNIQUE,
  `email_verified` integer DEFAULT 0,
  `image` text,
  `role` text DEFAULT 'user',
  `created_at` integer DEFAULT (unixepoch()) NOT NULL
);

-- ── Sessions ───────────────────────────────────
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`),
  `token` text NOT NULL UNIQUE,
  `expires_at` integer NOT NULL,
  `created_at` integer DEFAULT (unixepoch()) NOT NULL
);

-- ── Accounts ───────────────────────────────────
CREATE TABLE IF NOT EXISTS `accounts` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`),
  `account_id` text NOT NULL,
  `provider_id` text NOT NULL,
  `access_token` text,
  `refresh_token` text,
  `id_token` text,
  `access_token_expires_at` integer,
  `scope` text,
  `password` text,
  `created_at` integer DEFAULT (unixepoch()) NOT NULL,
  `updated_at` integer DEFAULT (unixepoch()) NOT NULL
);

-- ── Verifications ──────────────────────────────
CREATE TABLE IF NOT EXISTS `verifications` (
  `id` text PRIMARY KEY NOT NULL,
  `identifier` text NOT NULL,
  `value` text NOT NULL,
  `expires_at` integer NOT NULL,
  `created_at` integer DEFAULT (unixepoch()) NOT NULL,
  `updated_at` integer DEFAULT (unixepoch()) NOT NULL
);

-- ── Product categories ─────────────────────────
CREATE TABLE IF NOT EXISTS `product_categories` (
  `id` text PRIMARY KEY NOT NULL,
  `slug` text NOT NULL UNIQUE,
  `name` text NOT NULL,
  `parent_id` text REFERENCES `product_categories`(`id`),
  `order` integer DEFAULT 0
);

-- ── Products ───────────────────────────────────
CREATE TABLE IF NOT EXISTS `products` (
  `id` text PRIMARY KEY NOT NULL,
  `slug` text NOT NULL UNIQUE,
  `category_id` text REFERENCES `product_categories`(`id`),
  `name` text NOT NULL,
  `summary` text,
  `description` text,
  `specs` text,
  `features` text,
  `datasheet_url` text,
  `image_url` text,
  `images` text,
  `published` integer DEFAULT 0,
  `order` integer DEFAULT 0,
  `created_at` integer DEFAULT (unixepoch()) NOT NULL
);

-- ── Solutions ──────────────────────────────────
CREATE TABLE IF NOT EXISTS `solutions` (
  `id` text PRIMARY KEY NOT NULL,
  `slug` text NOT NULL UNIQUE,
  `industry` text NOT NULL,
  `title` text NOT NULL,
  `content` text
);

-- ── Quote requests ─────────────────────────────
CREATE TABLE IF NOT EXISTS `quote_requests` (
  `id` text PRIMARY KEY NOT NULL,
  `email` text NOT NULL,
  `name` text,
  `company` text,
  `phone` text,
  `product` text,
  `message` text NOT NULL,
  `status` text DEFAULT 'new',
  `created_at` integer DEFAULT (unixepoch()) NOT NULL
);

-- ── News posts ─────────────────────────────────
CREATE TABLE IF NOT EXISTS `news_posts` (
  `id` text PRIMARY KEY NOT NULL,
  `slug` text NOT NULL UNIQUE,
  `title` text NOT NULL,
  `summary` text,
  `content` text,
  `status` text DEFAULT 'draft',
  `published_at` integer,
  `created_at` integer DEFAULT (unixepoch()) NOT NULL
);

-- ── Tags ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS `tags` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL UNIQUE,
  `slug` text NOT NULL UNIQUE
);

-- ── News post tags ─────────────────────────────
CREATE TABLE IF NOT EXISTS `news_post_tags` (
  `post_id` text NOT NULL REFERENCES `news_posts`(`id`),
  `tag_id` text NOT NULL REFERENCES `tags`(`id`)
);

-- ── Comments ───────────────────────────────────
CREATE TABLE IF NOT EXISTS `comments` (
  `id` text PRIMARY KEY NOT NULL,
  `post_id` text NOT NULL REFERENCES `news_posts`(`id`),
  `parent_id` text REFERENCES `comments`(`id`),
  `author_name` text NOT NULL,
  `author_email` text NOT NULL,
  `content` text NOT NULL,
  `status` text DEFAULT 'pending',
  `created_at` integer DEFAULT (unixepoch()) NOT NULL
);

-- ── Media ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS `media` (
  `id` text PRIMARY KEY NOT NULL,
  `key` text NOT NULL UNIQUE,
  `url` text NOT NULL,
  `filename` text NOT NULL,
  `mime_type` text NOT NULL,
  `size` integer NOT NULL,
  `uploaded_by` text REFERENCES `users`(`id`),
  `created_at` integer DEFAULT (unixepoch()) NOT NULL
);
