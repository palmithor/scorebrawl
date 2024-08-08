CREATE TABLE `league_event` (
	`id` text(32) PRIMARY KEY NOT NULL,
	`league_id` text(32) NOT NULL,
	`type` text NOT NULL,
	`text` text,
	`created_by` text(100) NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`league_id`) REFERENCES `league`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `league_invite` (
	`id` text(32) PRIMARY KEY NOT NULL,
	`league_id` text,
	`role` text NOT NULL,
	`code` text(32) NOT NULL,
	`expires_at` integer,
	`created_by` text NOT NULL,
	`updated_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`league_id`) REFERENCES `league`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `league_member` (
	`id` text(32) PRIMARY KEY NOT NULL,
	`user_id` text(100) NOT NULL,
	`league_id` text(32) NOT NULL,
	`role` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`league_id`) REFERENCES `league`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `league_player` (
	`id` text(32) PRIMARY KEY NOT NULL,
	`user_id` text(100) NOT NULL,
	`league_id` text(32) NOT NULL,
	`disabled` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`league_id`) REFERENCES `league`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `league_team_player` (
	`id` text(32) PRIMARY KEY NOT NULL,
	`league_player_id` text(32) NOT NULL,
	`team_id` text(32) NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`league_player_id`) REFERENCES `league_player`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`team_id`) REFERENCES `league_team`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `league_team` (
	`id` text(32) PRIMARY KEY NOT NULL,
	`name` text(100) NOT NULL,
	`league_id` text(32) NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`league_id`) REFERENCES `league`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `league` (
	`id` text(32) PRIMARY KEY NOT NULL,
	`name` text(100) NOT NULL,
	`name_slug` text(100) NOT NULL,
	`logo_url` text(100),
	`code` text(32) NOT NULL,
	`archived` integer DEFAULT false NOT NULL,
	`created_by` text NOT NULL,
	`updated_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `match_player` (
	`id` text(32) PRIMARY KEY NOT NULL,
	`season_player_id` text(32) NOT NULL,
	`home_team` integer DEFAULT false NOT NULL,
	`match_id` text(32) NOT NULL,
	`score_before` integer DEFAULT -1 NOT NULL,
	`score_after` integer DEFAULT -1 NOT NULL,
	`result` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`season_player_id`) REFERENCES `season_player`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`match_id`) REFERENCES `match`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `match` (
	`id` text(32) PRIMARY KEY NOT NULL,
	`season_id` text(32) NOT NULL,
	`home_score` integer NOT NULL,
	`away_score` integer NOT NULL,
	`home_expected_elo` real,
	`away_expected_elo` real,
	`created_by` text NOT NULL,
	`updated_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`season_id`) REFERENCES `season`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `season_player` (
	`id` text(32) PRIMARY KEY NOT NULL,
	`season_id` text(32) NOT NULL,
	`league_player_id` text(32) NOT NULL,
	`score` integer NOT NULL,
	`disabled` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`season_id`) REFERENCES `season`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`league_player_id`) REFERENCES `league_player`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `season_team` (
	`id` text(32) PRIMARY KEY NOT NULL,
	`season_id` text(32) NOT NULL,
	`team_id` text(32) NOT NULL,
	`score` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`season_id`) REFERENCES `season`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`team_id`) REFERENCES `league_team`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `season` (
	`id` text(32) PRIMARY KEY NOT NULL,
	`name` text(100) NOT NULL,
	`name_slug` text(100) NOT NULL,
	`initial_score` integer NOT NULL,
	`score_type` text NOT NULL,
	`k_factor` integer NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer NOT NULL,
	`league_id` text(32) NOT NULL,
	`created_by` text NOT NULL,
	`updated_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`league_id`) REFERENCES `league`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `season_team_match` (
	`id` text(32) PRIMARY KEY NOT NULL,
	`season_team_id` text(32) NOT NULL,
	`match_id` text(32) NOT NULL,
	`score_before` integer DEFAULT -1 NOT NULL,
	`score_after` integer DEFAULT -1 NOT NULL,
	`result` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`season_team_id`) REFERENCES `season_team`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`match_id`) REFERENCES `match`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text(100) PRIMARY KEY NOT NULL,
	`image_url` text(255) NOT NULL,
	`name` text NOT NULL,
	`defaultLeagueId` text(32),
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`defaultLeagueId`) REFERENCES `league`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `league_invite_code_uq_idx` ON `league_invite` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `league_member_uq_idx` ON `league_member` (`league_id`,`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `league_player_uq_idx` ON `league_player` (`league_id`,`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `league_team_player_uq_idx` ON `league_team_player` (`team_id`,`league_player_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `league_name_slug_uq_idx` ON `league` (`name_slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `league_code_uq_idx` ON `league` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `season_player_uq_idx` ON `season_player` (`season_id`,`league_player_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `season_team_uq_idx` ON `season_team` (`season_id`,`team_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `season_name_slug_uq_idx` ON `season` (`name_slug`);