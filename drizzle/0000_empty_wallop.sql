CREATE TABLE `auth_access_tokens` (
	`id` int NOT NULL,
	`type` varchar(40) NOT NULL,
	`hash` varchar(255) NOT NULL,
	`alive_by` varchar(14) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`last_used_at` datetime,
	`expires_at` datetime NOT NULL,
	CONSTRAINT `auth_access_tokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`lastname` varchar(255),
	`email` varchar(255) NOT NULL,
	`password` varchar(72) NOT NULL,
	`age` int,
	`role_id` varchar(50) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`role` varchar(50) NOT NULL,
	`is_role_active` int NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `user_roles_role` PRIMARY KEY(`role`)
);
--> statement-breakpoint
ALTER TABLE `auth_access_tokens` ADD CONSTRAINT `auth_access_tokens_id_users_id_fk` FOREIGN KEY (`id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_role_id_user_roles_role_fk` FOREIGN KEY (`role_id`) REFERENCES `user_roles`(`role`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `auth_token_id_idx` ON `auth_access_tokens` (`id`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `auth_access_tokens` (`type`);--> statement-breakpoint
CREATE INDEX `alive_by_idx` ON `auth_access_tokens` (`alive_by`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `role_id_idx` ON `users` (`role_id`);--> statement-breakpoint
CREATE INDEX `role_idx` ON `user_roles` (`role`);--> statement-breakpoint
CREATE INDEX `is_role_active_idx` ON `user_roles` (`is_role_active`);

--> statement-breakpoint
INSERT INTO `user_roles` (`role`,is_role_active,created_at,updated_at,deleted_at) VALUES
	('ADMIN',1,'2024-12-14 22:04:34','2024-12-14 22:04:34',NULL),
	('USER',1,'2024-12-14 22:04:34','2024-12-14 22:04:34',NULL);
