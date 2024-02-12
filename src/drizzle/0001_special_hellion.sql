CREATE TABLE `products` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`price` float NOT NULL DEFAULT 0,
	`quantity` int NOT NULL DEFAULT 0,
	`description` varchar(255) NOT NULL,
	`seller_id` varchar(255),
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_seller_id_users_id_fk` FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;