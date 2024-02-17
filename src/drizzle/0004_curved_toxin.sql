CREATE TABLE `order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoice` varchar(255) NOT NULL,
	`order_id` int,
	`cart_id` varchar(255),
	`quantity` int NOT NULL DEFAULT 0,
	`price` float NOT NULL DEFAULT 0,
	`is_paid` boolean NOT NULL DEFAULT false,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cart_id` varchar(255),
	`user_id` varchar(255),
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_cart_id_cart_id_fk` FOREIGN KEY (`cart_id`) REFERENCES `cart`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_cart_id_cart_id_fk` FOREIGN KEY (`cart_id`) REFERENCES `cart`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;