PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_blog_posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`r2_key` text NOT NULL,
	`title` text NOT NULL,
	`excerpt` text NOT NULL,
	`date` text NOT NULL,
	`draft` integer DEFAULT true NOT NULL,
	`is_published` integer DEFAULT false NOT NULL,
	`content_hash` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_blog_posts`("id", "slug", "r2_key", "title", "excerpt", "date", "draft", "is_published", "content_hash", "created_at", "updated_at") SELECT "id", "slug", "r2_key", "title", "excerpt", "date", "draft", "is_published", "content_hash", "created_at", "updated_at" FROM `blog_posts`;--> statement-breakpoint
DROP TABLE `blog_posts`;--> statement-breakpoint
ALTER TABLE `__new_blog_posts` RENAME TO `blog_posts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `blog_posts_slug_unique` ON `blog_posts` (`slug`);