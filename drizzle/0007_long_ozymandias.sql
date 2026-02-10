CREATE TABLE `operationIncidents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`operationId` int NOT NULL,
	`memberId` int,
	`reportedBy` int NOT NULL,
	`incidentType` enum('absence','late_arrival','early_departure','misconduct','accident','equipment_issue','quality_issue','other') NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL,
	`description` text NOT NULL,
	`photos` text,
	`status` enum('open','investigating','resolved') NOT NULL DEFAULT 'open',
	`resolvedAt` timestamp,
	`resolution` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `operationIncidents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `operationMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`operationId` int NOT NULL,
	`workerId` int NOT NULL,
	`allocationId` int,
	`jobFunction` varchar(100) NOT NULL,
	`dailyRate` decimal(10,2) NOT NULL,
	`status` enum('invited','accepted','rejected','present','absent','completed') NOT NULL DEFAULT 'invited',
	`acceptedAt` timestamp,
	`acceptanceIp` varchar(45),
	`cpfConfirmed` boolean DEFAULT false,
	`termAccepted` boolean DEFAULT false,
	`checkInTime` timestamp,
	`checkOutTime` timestamp,
	`tookMeal` boolean DEFAULT false,
	`usedEpi` boolean DEFAULT false,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `operationMembers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `operations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`locationId` int NOT NULL,
	`contractId` int,
	`shiftId` int NOT NULL,
	`leaderId` int NOT NULL,
	`createdBy` int NOT NULL,
	`operationName` varchar(255) NOT NULL,
	`workDate` date NOT NULL,
	`description` text,
	`status` enum('created','pending_accept','accepted','in_progress','completed','billed') NOT NULL DEFAULT 'created',
	`acceptedAt` timestamp,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`billedAt` timestamp,
	`totalWorkers` int DEFAULT 0,
	`totalDailyRate` decimal(10,2),
	`totalMealCost` decimal(10,2),
	`totalNetPay` decimal(10,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `operations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','leader','supervisor','worker','client') NOT NULL DEFAULT 'worker';--> statement-breakpoint
ALTER TABLE `operationIncidents` ADD CONSTRAINT `operationIncidents_operationId_operations_id_fk` FOREIGN KEY (`operationId`) REFERENCES `operations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `operationIncidents` ADD CONSTRAINT `operationIncidents_memberId_operationMembers_id_fk` FOREIGN KEY (`memberId`) REFERENCES `operationMembers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `operationIncidents` ADD CONSTRAINT `operationIncidents_reportedBy_users_id_fk` FOREIGN KEY (`reportedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `operationMembers` ADD CONSTRAINT `operationMembers_operationId_operations_id_fk` FOREIGN KEY (`operationId`) REFERENCES `operations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `operationMembers` ADD CONSTRAINT `operationMembers_workerId_workers_id_fk` FOREIGN KEY (`workerId`) REFERENCES `workers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `operationMembers` ADD CONSTRAINT `operationMembers_allocationId_allocations_id_fk` FOREIGN KEY (`allocationId`) REFERENCES `allocations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `operations` ADD CONSTRAINT `operations_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `operations` ADD CONSTRAINT `operations_locationId_workLocations_id_fk` FOREIGN KEY (`locationId`) REFERENCES `workLocations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `operations` ADD CONSTRAINT `operations_contractId_contracts_id_fk` FOREIGN KEY (`contractId`) REFERENCES `contracts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `operations` ADD CONSTRAINT `operations_shiftId_shifts_id_fk` FOREIGN KEY (`shiftId`) REFERENCES `shifts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `operations` ADD CONSTRAINT `operations_leaderId_users_id_fk` FOREIGN KEY (`leaderId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `operations` ADD CONSTRAINT `operations_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;