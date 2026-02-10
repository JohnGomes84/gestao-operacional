ALTER TABLE `workers` MODIFY COLUMN `status` enum('active','inactive','blocked') NOT NULL DEFAULT 'inactive';--> statement-breakpoint
ALTER TABLE `workers` ADD `dateOfBirth` date;--> statement-breakpoint
ALTER TABLE `workers` ADD `motherName` varchar(255);--> statement-breakpoint
ALTER TABLE `workers` ADD `email` varchar(320);--> statement-breakpoint
ALTER TABLE `workers` ADD `street` varchar(255);--> statement-breakpoint
ALTER TABLE `workers` ADD `number` varchar(20);--> statement-breakpoint
ALTER TABLE `workers` ADD `complement` varchar(100);--> statement-breakpoint
ALTER TABLE `workers` ADD `neighborhood` varchar(100);--> statement-breakpoint
ALTER TABLE `workers` ADD `city` varchar(100);--> statement-breakpoint
ALTER TABLE `workers` ADD `state` varchar(2);--> statement-breakpoint
ALTER TABLE `workers` ADD `zipCode` varchar(10);--> statement-breakpoint
ALTER TABLE `workers` ADD `pixKeyType` enum('cpf','cnpj','email','phone','random');--> statement-breakpoint
ALTER TABLE `workers` ADD `documentPhotoUrl` text;--> statement-breakpoint
ALTER TABLE `workers` ADD `documentType` enum('rg','cnh','rne');--> statement-breakpoint
ALTER TABLE `workers` ADD `registrationStatus` enum('pending','approved','rejected') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `workers` ADD `approvedBy` int;--> statement-breakpoint
ALTER TABLE `workers` ADD `approvedAt` timestamp;--> statement-breakpoint
ALTER TABLE `workers` ADD `rejectionReason` text;--> statement-breakpoint
ALTER TABLE `workers` ADD CONSTRAINT `workers_approvedBy_users_id_fk` FOREIGN KEY (`approvedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;