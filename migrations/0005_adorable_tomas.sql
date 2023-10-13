CREATE TABLE `league_team_player` (
	`id` text(32) PRIMARY KEY NOT NULL,
	`league_player_id` text(32) NOT NULL,
	`team_id` text(32) NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);

CREATE UNIQUE INDEX `league_team_player_uq_idx` ON `league_team_player` (`team_id`,`league_player_id`);