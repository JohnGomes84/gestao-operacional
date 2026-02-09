CREATE TABLE `allocations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workerId` int NOT NULL,
	`clientId` int NOT NULL,
	`locationId` int NOT NULL,
	`workDate` date NOT NULL,
	`status` enum('scheduled','confirmed','in_progress','completed','cancelled') NOT NULL DEFAULT 'scheduled',
	`checkInTime` timestamp,
	`checkOutTime` timestamp,
	`checkInLocation` varchar(100),
	`checkOutLocation` varchar(100),
	`dailyRate` decimal(10,2),
	`mealTicket` decimal(10,2) DEFAULT '30.00',
	`consecutiveDays` int DEFAULT 1,
	`daysThisMonth` int DEFAULT 1,
	`riskFlag` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `allocations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`cnpj` varchar(18),
	`contactName` varchar(255),
	`contactPhone` varchar(20),
	`contactEmail` varchar(320),
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `epiRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workerId` int NOT NULL,
	`epiType` varchar(100) NOT NULL,
	`epiDescription` text,
	`deliveryDate` date NOT NULL,
	`expiryDate` date,
	`returnDate` date,
	`workerSignature` varchar(64),
	`supervisorSignature` varchar(64),
	`clientSignature` varchar(64),
	`deliveryPhoto` varchar(500),
	`returnPhoto` varchar(500),
	`status` enum('active','expired','returned') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `epiRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `evaluations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`allocationId` int NOT NULL,
	`rating` int NOT NULL,
	`feedback` text,
	`evaluatedBy` varchar(255),
	`lowRatingNotified` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `evaluations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `incidents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`allocationId` int NOT NULL,
	`incidentType` enum('accident','near_miss','equipment_failure','quality_issue','other') NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL,
	`description` text NOT NULL,
	`photos` text,
	`notifiedAt` timestamp,
	`notifiedTo` varchar(320),
	`status` enum('open','investigating','resolved','closed') NOT NULL DEFAULT 'open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `incidents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workerId` int NOT NULL,
	`periodStart` date NOT NULL,
	`periodEnd` date NOT NULL,
	`daysWorked` int NOT NULL,
	`dailyRate` decimal(10,2) NOT NULL,
	`grossAmount` decimal(10,2) NOT NULL,
	`mealTickets` decimal(10,2) NOT NULL,
	`inssDeduction` decimal(10,2) DEFAULT '0.00',
	`netAmount` decimal(10,2) NOT NULL,
	`paymentMethod` enum('pix','bank_transfer','cash') NOT NULL DEFAULT 'pix',
	`paymentDate` date,
	`paymentStatus` enum('pending','paid','cancelled') NOT NULL DEFAULT 'pending',
	`receiptUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `procedureReadLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`procedureId` int NOT NULL,
	`workerId` int NOT NULL,
	`readAt` timestamp NOT NULL DEFAULT (now()),
	`confirmedRead` boolean DEFAULT false,
	CONSTRAINT `procedureReadLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `procedures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`fileUrl` varchar(500) NOT NULL,
	`fileType` varchar(50),
	`qrCodeUrl` varchar(500),
	`version` varchar(20) NOT NULL DEFAULT '1.0',
	`status` enum('active','archived') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `procedures_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shiftChecklists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`allocationId` int NOT NULL,
	`checklistData` text NOT NULL,
	`workerSignature` varchar(64),
	`supervisorSignature` varchar(64),
	`observations` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shiftChecklists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workLocations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`locationName` varchar(255) NOT NULL,
	`address` text NOT NULL,
	`city` varchar(100),
	`state` varchar(2),
	`zipCode` varchar(10),
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workLocations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workOffers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workerId` int NOT NULL,
	`clientId` int NOT NULL,
	`locationId` int NOT NULL,
	`workDate` date NOT NULL,
	`offeredRate` decimal(10,2) NOT NULL,
	`response` enum('pending','accepted','refused') NOT NULL DEFAULT 'pending',
	`refusalReason` text,
	`respondedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workOffers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workerTerms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workerId` int NOT NULL,
	`acceptedAt` timestamp NOT NULL DEFAULT (now()),
	`ipAddress` varchar(45),
	`userAgent` text,
	`geolocation` varchar(100),
	`termVersion` varchar(20) NOT NULL,
	`termContent` text NOT NULL,
	`signatureHash` varchar(64),
	CONSTRAINT `workerTerms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`fullName` varchar(255) NOT NULL,
	`cpf` varchar(14) NOT NULL,
	`phone` varchar(20),
	`pixKey` varchar(255),
	`workerType` enum('daily','freelancer','mei','clt') NOT NULL,
	`dailyRate` decimal(10,2),
	`status` enum('active','inactive','blocked') NOT NULL DEFAULT 'active',
	`riskScore` int DEFAULT 0,
	`riskLevel` enum('low','medium','high','critical') DEFAULT 'low',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workers_id` PRIMARY KEY(`id`),
	CONSTRAINT `workers_cpf_unique` UNIQUE(`cpf`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','supervisor','worker','client') NOT NULL DEFAULT 'worker';--> statement-breakpoint
ALTER TABLE `allocations` ADD CONSTRAINT `allocations_workerId_workers_id_fk` FOREIGN KEY (`workerId`) REFERENCES `workers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `allocations` ADD CONSTRAINT `allocations_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `allocations` ADD CONSTRAINT `allocations_locationId_workLocations_id_fk` FOREIGN KEY (`locationId`) REFERENCES `workLocations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `epiRecords` ADD CONSTRAINT `epiRecords_workerId_workers_id_fk` FOREIGN KEY (`workerId`) REFERENCES `workers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `evaluations` ADD CONSTRAINT `evaluations_allocationId_allocations_id_fk` FOREIGN KEY (`allocationId`) REFERENCES `allocations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `incidents` ADD CONSTRAINT `incidents_allocationId_allocations_id_fk` FOREIGN KEY (`allocationId`) REFERENCES `allocations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_workerId_workers_id_fk` FOREIGN KEY (`workerId`) REFERENCES `workers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `procedureReadLogs` ADD CONSTRAINT `procedureReadLogs_procedureId_procedures_id_fk` FOREIGN KEY (`procedureId`) REFERENCES `procedures`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `procedureReadLogs` ADD CONSTRAINT `procedureReadLogs_workerId_workers_id_fk` FOREIGN KEY (`workerId`) REFERENCES `workers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `procedures` ADD CONSTRAINT `procedures_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shiftChecklists` ADD CONSTRAINT `shiftChecklists_allocationId_allocations_id_fk` FOREIGN KEY (`allocationId`) REFERENCES `allocations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workLocations` ADD CONSTRAINT `workLocations_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workOffers` ADD CONSTRAINT `workOffers_workerId_workers_id_fk` FOREIGN KEY (`workerId`) REFERENCES `workers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workOffers` ADD CONSTRAINT `workOffers_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workOffers` ADD CONSTRAINT `workOffers_locationId_workLocations_id_fk` FOREIGN KEY (`locationId`) REFERENCES `workLocations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workerTerms` ADD CONSTRAINT `workerTerms_workerId_workers_id_fk` FOREIGN KEY (`workerId`) REFERENCES `workers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workers` ADD CONSTRAINT `workers_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;