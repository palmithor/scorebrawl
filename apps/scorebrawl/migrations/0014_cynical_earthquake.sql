ALTER TABLE match_player ADD `score_before` integer;--> statement-breakpoint
ALTER TABLE match_player ADD `score_after` integer;--> statement-breakpoint
ALTER TABLE season_player ADD `score` integer;--> statement-breakpoint
ALTER TABLE season_team_match ADD `score_before` integer;--> statement-breakpoint
ALTER TABLE season_team_match ADD `score_after` integer;--> statement-breakpoint
ALTER TABLE season_team ADD `score` integer;--> statement-breakpoint
ALTER TABLE season ADD `initial_score` integer;--> statement-breakpoint
ALTER TABLE season ADD `score_type` text;
