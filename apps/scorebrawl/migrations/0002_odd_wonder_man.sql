CREATE TABLE `league_event` (
	`id` text(32) PRIMARY KEY NOT NULL,
	`league_id` text(32) NOT NULL,
	`type` text NOT NULL,
	`data` blob,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL
);
