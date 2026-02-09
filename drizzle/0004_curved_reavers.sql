ALTER TABLE `allocations` ADD `contractId` int;--> statement-breakpoint
ALTER TABLE `allocations` ADD `shiftId` int;--> statement-breakpoint
ALTER TABLE `allocations` ADD `workerSignatureIn` text;--> statement-breakpoint
ALTER TABLE `allocations` ADD `workerSignatureOut` text;--> statement-breakpoint
ALTER TABLE `allocations` ADD `supervisorId` int;--> statement-breakpoint
ALTER TABLE `allocations` ADD `tookMeal` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `allocations` ADD `uniformProvided` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `allocations` ADD `epiProvided` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `allocations` ADD `mealCost` decimal(10,2) DEFAULT '25.00';--> statement-breakpoint
ALTER TABLE `allocations` ADD `netPay` decimal(10,2);--> statement-breakpoint
ALTER TABLE `allocations` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `allocations` ADD CONSTRAINT `allocations_contractId_contracts_id_fk` FOREIGN KEY (`contractId`) REFERENCES `contracts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `allocations` ADD CONSTRAINT `allocations_shiftId_shifts_id_fk` FOREIGN KEY (`shiftId`) REFERENCES `shifts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `allocations` ADD CONSTRAINT `allocations_supervisorId_users_id_fk` FOREIGN KEY (`supervisorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;