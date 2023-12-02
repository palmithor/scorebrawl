CREATE TABLE `season_team_match` (
	`id` text(32) PRIMARY KEY NOT NULL,
	`season_team_id` text(32) NOT NULL,
	`match_id` text(32) NOT NULL,
	`elo_before` integer DEFAULT -1 NOT NULL,
	`elo_after` integer DEFAULT -1 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
