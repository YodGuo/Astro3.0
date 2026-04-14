-- Migration: 0007_add_indexes
-- Performance: add indexes for high-frequency query patterns
-- Run: npx wrangler d1 execute my-b2b-db --file=./migrations/0007_add_indexes.sql
--
-- Index selection based on actual WHERE/ORDER BY clauses in src/pages/api/:
--   comments:      WHERE post_id, ORDER BY created_at, WHERE status
--   products:      WHERE published, ORDER BY created_at, WHERE category_id
--   news_posts:    WHERE status, ORDER BY published_at
--   news_post_tags: WHERE post_id, WHERE tag_id (join table)
--   quote_requests: WHERE status, ORDER BY created_at
--
-- All indexes use IF NOT EXISTS to be idempotent (safe to re-run).
-- SQLite CREATE INDEX is non-blocking for reads.

-- ── Comments ───────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments (post_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments (created_at);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments (status);

-- ── Products ───────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_published ON products (published);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products (created_at);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products (category_id);

-- ── News posts ─────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_news_posts_status ON news_posts (status);
CREATE INDEX IF NOT EXISTS idx_news_posts_published_at ON news_posts (published_at);

-- ── News post tags (join table) ────────────────
CREATE INDEX IF NOT EXISTS idx_news_post_tags_post_id ON news_post_tags (post_id);
CREATE INDEX IF NOT EXISTS idx_news_post_tags_tag_id ON news_post_tags (tag_id);

-- ── Quote requests ─────────────────────────────
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests (status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at ON quote_requests (created_at);
