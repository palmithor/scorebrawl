CREATE TABLE `user` (
	`id` text(32) PRIMARY KEY NOT NULL,
	`image_url` text,
	`name` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
