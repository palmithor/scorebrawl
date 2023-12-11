CREATE TABLE `league_member` (
	`id` text(32) PRIMARY KEY NOT NULL,
	`user_id` text(100) NOT NULL,
	`league_id` text(32) NOT NULL,
	`role` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `league_player` (
	`id` text(32) PRIMARY KEY NOT NULL,
	`user_id` text(100) NOT NULL,
	`league_id` text(32) NOT NULL,
	`disabled` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `league` (
	`id` text(32) PRIMARY KEY NOT NULL,
	`name` text(100) NOT NULL,
	`name_slug` text(100) NOT NULL,
	`logo_url` text(100),
	`visibility` text DEFAULT 'public' NOT NULL,
	`code` text(32) NOT NULL,
	`archived` integer DEFAULT false NOT NULL,
	`created_by` text NOT NULL,
	`updated_by` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `match_player` (
	`id` text(32) PRIMARY KEY NOT NULL,
	`season_player_id` text(32) NOT NULL,
	`home_team` integer NOT NULL,
	`match_id` text(32) NOT NULL,
	`elo` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `match` (
	`id` text(32) PRIMARY KEY NOT NULL,
	`season_id` text(32) NOT NULL,
	`home_score` integer NOT NULL,
	`away_score` integer NOT NULL,
	`home_expected_elo` real NOT NULL,
	`away_expected_elo` real NOT NULL,
	`created_by` text NOT NULL,
	`updated_by` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `season_player` (
	`id` text(32) PRIMARY KEY NOT NULL,
	`season_id` text(32) NOT NULL,
	`league_player_id` text(32) NOT NULL,
	`elo` integer NOT NULL,
	`disabled` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `season` (
	`id` text(32) PRIMARY KEY NOT NULL,
	`name` text(100) NOT NULL,
	`name_slug` text(100) NOT NULL,
	`initial_elo` integer NOT NULL,
	`k_factor` integer NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer,
	`league_id` text(32) NOT NULL,
	`created_by` text NOT NULL,
	`updated_by` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `league_member_uq_idx` ON `league_member` (`league_id`,`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `league_player_uq_idx` ON `league_player` (`league_id`,`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `league_name_slug_uq_idx` ON `league` (`name_slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `league_code_uq_idx` ON `league` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `season_player_uq_idx` ON `season_player` (`season_id`,`league_player_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `season_name_slug_uq_idx` ON `season` (`name_slug`);