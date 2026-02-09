CREATE TABLE `contracts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`contractName` varchar(255) NOT NULL,
	`contractNumber` varchar(100),
	`startDate` date NOT NULL,
	`endDate` date,
	`dailyRates` text NOT NULL,
	`providesUniform` boolean NOT NULL DEFAULT true,
	`providesEpi` boolean NOT NULL DEFAULT true,
	`providesMeal` boolean NOT NULL DEFAULT true,
	`mealCost` decimal(10,2) DEFAULT '25.00',
	`mealTicketValue` decimal(10,2) DEFAULT '30.00',
	`billingCycle` enum('weekly','biweekly','monthly') NOT NULL DEFAULT 'biweekly',
	`chargePerPerson` decimal(10,2) NOT NULL,
	`status` enum('active','inactive','expired') NOT NULL DEFAULT 'active',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contracts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shifts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`shiftName` varchar(100) NOT NULL,
	`startTime` varchar(5) NOT NULL,
	`endTime` varchar(5) NOT NULL,
	`description` text,
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shifts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `contracts` ADD CONSTRAINT `contracts_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shifts` ADD CONSTRAINT `shifts_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;