ALTER TABLE match_player ADD `elo_before` integer DEFAULT -1 NOT NULL;--> statement-breakpoint
ALTER TABLE match_player ADD `elo_after` integer DEFAULT -1 NOT NULL;--> statement-breakpoint
ALTER TABLE `match_player` DROP COLUMN `elo`;