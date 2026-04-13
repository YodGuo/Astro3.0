-- Migration 0008: Add database constraints
-- - DB-01: Composite primary key on news_post_tags (post_id, tag_id)
-- - DB-02: CHECK constraints on status fields (quote_requests, news_posts, comments)
-- - DB-03: CHECK constraint on users.role
--
-- SQLite does not support ALTER TABLE ADD CONSTRAINT for CHECK or PRIMARY KEY.
-- We use the standard "recreate table" pattern: CREATE new → INSERT → DROP old → RENAME.

-- ── 1. news_post_tags: Add composite primary key (post_id, tag_id) ──

-- Remove existing single-column indexes (they'll be superseded by the PK)
DROP INDEX IF EXISTS `idx_news_post_tags_post_id`;
DROP INDEX IF EXISTS `idx_news_post_tags_tag_id`;

CREATE TABLE `news_post_tags_new` (
  `post_id` text NOT NULL REFERENCES `news_posts`(`id`) ON DELETE CASCADE,
  `tag_id` text NOT NULL REFERENCES `tags`(`id`) ON DELETE CASCADE,
  PRIMARY KEY (`post_id`, `tag_id`)
);

INSERT INTO `news_post_tags_new` SELECT DISTINCT `post_id`, `tag_id` FROM `news_post_tags`;

DROP TABLE `news_post_tags`;
ALTER TABLE `news_post_tags_new` RENAME TO `news_post_tags`;

-- ── 2. quote_requests: Add CHECK constraint on status ──

CREATE TABLE `quote_requests_new` (
  `id` text PRIMARY KEY,
  `email` text NOT NULL,
  `name` text,
  `company` text,
  `phone` text,
  `product` text,
  `message` text NOT NULL,
  `status` text DEFAULT 'new' CHECK (`status` IN ('new', 'contacted', 'quoted', 'closed')),
  `created_at` integer DEFAULT (unixepoch()) NOT NULL
);

INSERT INTO `quote_requests_new` SELECT * FROM `quote_requests`;
DROP TABLE `quote_requests`;
ALTER TABLE `quote_requests_new` RENAME TO `quote_requests`;

-- Recreate index
CREATE INDEX IF NOT EXISTS `idx_quote_requests_status` ON `quote_requests` (`status`);

-- ── 3. news_posts: Add CHECK constraint on status ──

CREATE TABLE `news_posts_new` (
  `id` text PRIMARY KEY,
  `slug` text NOT NULL UNIQUE,
  `title` text NOT NULL,
  `summary` text,
  `content` text,
  `status` text DEFAULT 'draft' CHECK (`status` IN ('draft', 'published')),
  `published_at` integer,
  `created_at` integer DEFAULT (unixepoch()) NOT NULL
);

INSERT INTO `news_posts_new` SELECT * FROM `news_posts`;
DROP TABLE `news_posts`;
ALTER TABLE `news_posts_new` RENAME TO `news_posts`;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS `idx_news_posts_status` ON `news_posts` (`status`);
CREATE INDEX IF NOT EXISTS `idx_news_posts_slug` ON `news_posts` (`slug`);

-- ── 4. comments: Add CHECK constraint on status ──

CREATE TABLE `comments_new` (
  `id` text PRIMARY KEY,
  `post_id` text NOT NULL REFERENCES `news_posts`(`id`) ON DELETE CASCADE,
  `parent_id` text REFERENCES `comments`(`id`),
  `author_name` text NOT NULL,
  `author_email` text NOT NULL,
  `content` text NOT NULL,
  `status` text DEFAULT 'pending' CHECK (`status` IN ('pending', 'approved', 'rejected')),
  `created_at` integer DEFAULT (unixepoch()) NOT NULL
);

INSERT INTO `comments_new` SELECT * FROM `comments`;
DROP TABLE `comments`;
ALTER TABLE `comments_new` RENAME TO `comments`;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS `idx_comments_post_id` ON `comments` (`post_id`);
CREATE INDEX IF NOT EXISTS `idx_comments_status` ON `comments` (`status`);

-- ── 5. users: Add CHECK constraint on role ──

CREATE TABLE `users_new` (
  `id` text PRIMARY KEY,
  `name` text,
  `email` text NOT NULL UNIQUE,
  `email_verified` integer DEFAULT 0,
  `image` text,
  `role` text DEFAULT 'user' CHECK (`role` IN ('admin', 'user')),
  `created_at` integer DEFAULT (unixepoch()) NOT NULL,
  `updated_at` integer DEFAULT (unixepoch()) NOT NULL
);

INSERT INTO `users_new` SELECT * FROM `users`;
DROP TABLE `users`;
ALTER TABLE `users_new` RENAME TO `users`;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS `idx_users_email` ON `users` (`email`);
