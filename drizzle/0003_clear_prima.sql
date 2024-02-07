CREATE TABLE `random_user` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	CONSTRAINT `random_user_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `testing` DROP FOREIGN KEY `testing_table_id_table_id_fk`;
--> statement-breakpoint
ALTER TABLE `testing` ADD CONSTRAINT `testing_table_id_random_user_id_fk` FOREIGN KEY (`table_id`) REFERENCES `random_user`(`id`) ON DELETE no action ON UPDATE no action;