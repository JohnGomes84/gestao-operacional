CREATE TABLE `workerBlockHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workerId` int NOT NULL,
	`actionBy` int NOT NULL,
	`action` enum('blocked','unblocked') NOT NULL,
	`reason` text NOT NULL,
	`blockType` enum('temporary','permanent'),
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workerBlockHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `workers` ADD `isBlocked` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `workers` ADD `blockReason` text;--> statement-breakpoint
ALTER TABLE `workers` ADD `blockedAt` timestamp;--> statement-breakpoint
ALTER TABLE `workers` ADD `blockedBy` int;--> statement-breakpoint
ALTER TABLE `workers` ADD `blockType` enum('temporary','permanent');--> statement-breakpoint
ALTER TABLE `workers` ADD `blockExpiresAt` timestamp;--> statement-breakpoint
ALTER TABLE `workerBlockHistory` ADD CONSTRAINT `workerBlockHistory_workerId_workers_id_fk` FOREIGN KEY (`workerId`) REFERENCES `workers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workerBlockHistory` ADD CONSTRAINT `workerBlockHistory_actionBy_users_id_fk` FOREIGN KEY (`actionBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workers` ADD CONSTRAINT `workers_blockedBy_users_id_fk` FOREIGN KEY (`blockedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;