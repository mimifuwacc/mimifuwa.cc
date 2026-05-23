-- Rollback: 20260331_024943_add_post_hash
-- Created at: 2026-03-31T02:49:43+09:00

-- Drop content_hash column from blog_posts
-- SQLite doesn't support ALTER TABLE DROP COLUMN, so we need to recreate
CREATE TABLE IF NOT EXISTS blog_posts_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  r2_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  date TEXT NOT NULL,
  draft INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

INSERT INTO blog_posts_new (id, slug, r2_key, title, excerpt, date, draft, created_at, updated_at)
SELECT id, slug, r2_key, title, excerpt, date, draft, created_at, updated_at
FROM blog_posts;

DROP TABLE blog_posts;

ALTER TABLE blog_posts_new RENAME TO blog_posts;

CREATE INDEX IF NOT EXISTS idx_blog_posts_date ON blog_posts(date DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_draft ON blog_posts(draft);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
