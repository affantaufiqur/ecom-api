CREATE TABLE `testing` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pub` varchar(256) NOT NULL,
	`table_id` int,
	CONSTRAINT `testing_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `testing` ADD CONSTRAINT `testing_table_id_table_id_fk` FOREIGN KEY (`table_id`) REFERENCES `table`(`id`) ON DELETE no action ON UPDATE no action;