ALTER TABLE `blog_posts` ADD `is_published` integer DEFAULT false NOT NULL;--> statement-breakpoint

-- 既存データ: draft=false だったもの（公開済み）は is_published=true に
UPDATE `blog_posts` SET is_published = CASE WHEN draft = 0 THEN 1 ELSE 0 END;
