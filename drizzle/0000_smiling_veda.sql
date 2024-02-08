CREATE TABLE `random_user` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	CONSTRAINT `random_user_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `testing` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pub` varchar(256) NOT NULL,
	`address` varchar(256) NOT NULL,
	`table_id` int,
	CONSTRAINT `testing_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `testing` ADD CONSTRAINT `testing_table_id_random_user_id_fk` FOREIGN KEY (`table_id`) REFERENCES `random_user`(`id`) ON DELETE no action ON UPDATE no action;