CREATE TABLE `event_store` (
	`id` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `operators` (
	`user_id` text PRIMARY KEY NOT NULL,
	`role` text NOT NULL,
	`created_at` text NOT NULL
);
