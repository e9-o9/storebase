-- Create stores table
CREATE TABLE `stores` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `domain` varchar(255),
  `storeType` varchar(64) DEFAULT 'shopify',
  `apiKey` varchar(255),
  `settings` json,
  `status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `stores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint

-- Create agentStoreChannels table
CREATE TABLE `agentStoreChannels` (
  `id` int AUTO_INCREMENT NOT NULL,
  `agentId` int NOT NULL,
  `storeId` int NOT NULL,
  `channelName` varchar(255),
  `isActive` int NOT NULL DEFAULT 1,
  `config` json,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `agentStoreChannels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint

-- Add indexes for better query performance
CREATE INDEX `stores_userId_idx` ON `stores` (`userId`);
--> statement-breakpoint
CREATE INDEX `agentStoreChannels_agentId_idx` ON `agentStoreChannels` (`agentId`);
--> statement-breakpoint
CREATE INDEX `agentStoreChannels_storeId_idx` ON `agentStoreChannels` (`storeId`);
--> statement-breakpoint

-- Add foreign key constraints (optional, but recommended)
-- ALTER TABLE `stores` ADD CONSTRAINT `stores_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
-- ALTER TABLE `agentStoreChannels` ADD CONSTRAINT `agentStoreChannels_agentId_agents_id_fk` FOREIGN KEY (`agentId`) REFERENCES `agents`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
-- ALTER TABLE `agentStoreChannels` ADD CONSTRAINT `agentStoreChannels_storeId_stores_id_fk` FOREIGN KEY (`storeId`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
