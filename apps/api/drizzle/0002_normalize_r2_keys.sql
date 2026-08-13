-- R2 stores Markdown under posts/{full slug}.md. Older rows could contain a key
-- derived from only the final slug segment. This only updates metadata; no post,
-- tag, or R2 object is deleted.
UPDATE `blog_posts`
SET
	`r2_key` = 'posts/' || `slug` || '.md',
	`updated_at` = strftime('%s', 'now')
WHERE `r2_key` != 'posts/' || `slug` || '.md';
