CREATE TABLE `workerAutonomyMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workerId` int NOT NULL,
	`totalRefusals` int NOT NULL DEFAULT 0,
	`uniqueClients` int NOT NULL DEFAULT 0,
	`uniqueLocations` int NOT NULL DEFAULT 0,
	`totalOperations` int NOT NULL DEFAULT 0,
	`firstOperationDate` timestamp,
	`lastOperationDate` timestamp,
	`autonomyScore` int NOT NULL DEFAULT 0,
	`lastCalculatedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workerAutonomyMetrics_id` PRIMARY KEY(`id`),
	CONSTRAINT `workerAutonomyMetrics_workerId_unique` UNIQUE(`workerId`)
);
--> statement-breakpoint
CREATE TABLE `workerRefusals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workerId` int NOT NULL,
	`operationId` int,
	`clientId` int,
	`refusalReason` text NOT NULL,
	`refusalDate` timestamp NOT NULL,
	`refusalType` enum('scheduling_conflict','distance','rate_too_low','personal_reasons','already_working','other') NOT NULL,
	`evidence` text,
	`registeredBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workerRefusals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `workerAutonomyMetrics` ADD CONSTRAINT `workerAutonomyMetrics_workerId_workers_id_fk` FOREIGN KEY (`workerId`) REFERENCES `workers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workerRefusals` ADD CONSTRAINT `workerRefusals_workerId_workers_id_fk` FOREIGN KEY (`workerId`) REFERENCES `workers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workerRefusals` ADD CONSTRAINT `workerRefusals_operationId_operations_id_fk` FOREIGN KEY (`operationId`) REFERENCES `operations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workerRefusals` ADD CONSTRAINT `workerRefusals_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workerRefusals` ADD CONSTRAINT `workerRefusals_registeredBy_users_id_fk` FOREIGN KEY (`registeredBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;