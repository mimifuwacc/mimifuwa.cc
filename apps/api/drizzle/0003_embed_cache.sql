CREATE TABLE `embed_cache` (
	`provider` text NOT NULL,
	`cache_key` text NOT NULL,
	`source_url` text NOT NULL,
	`payload_json` text NOT NULL,
	`fetched_at` integer NOT NULL,
	PRIMARY KEY (`provider`, `cache_key`)
);
CREATE INDEX `embed_cache_fetched_at_idx` ON `embed_cache` (`fetched_at`);
