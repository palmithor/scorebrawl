CREATE TABLE `season_team` (
	`id` text(32) PRIMARY KEY NOT NULL,
	`season_id` text(32) NOT NULL,
	`team_id` text(32) NOT NULL,
	`elo` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
