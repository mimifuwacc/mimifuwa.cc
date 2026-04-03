-- Migration: 20260331_024943_add_post_hash
-- Created at: 2026-03-31T02:49:43+09:00

-- Add content_hash column to blog_posts
ALTER TABLE blog_posts ADD COLUMN content_hash TEXT;
