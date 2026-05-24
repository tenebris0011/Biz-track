PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`irs_line` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "categories_type_check" CHECK(type IN ('income', 'expense'))
);
--> statement-breakpoint
INSERT INTO `__new_categories`("id", "user_id", "name", "type", "irs_line", "created_at") SELECT "id", "user_id", "name", "type", "irs_line", "created_at" FROM `categories`;--> statement-breakpoint
DROP TABLE `categories`;--> statement-breakpoint
ALTER TABLE `__new_categories` RENAME TO `categories`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_csv_import_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`import_type` text NOT NULL,
	`column_mappings` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "csv_import_templates_import_type_check" CHECK(import_type IN ('income', 'expense', 'trip'))
);
--> statement-breakpoint
INSERT INTO `__new_csv_import_templates`("id", "user_id", "name", "import_type", "column_mappings", "created_at") SELECT "id", "user_id", "name", "import_type", "column_mappings", "created_at" FROM `csv_import_templates`;--> statement-breakpoint
DROP TABLE `csv_import_templates`;--> statement-breakpoint
ALTER TABLE `__new_csv_import_templates` RENAME TO `csv_import_templates`;--> statement-breakpoint
CREATE TABLE `__new_recurrence_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`amount` real NOT NULL,
	`description` text NOT NULL,
	`category_id` text,
	`notes` text,
	`frequency` text NOT NULL,
	`is_subscription` integer DEFAULT false NOT NULL,
	`next_run_at` integer NOT NULL,
	`end_date` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "recurrence_rules_type_check" CHECK(type IN ('income', 'expense')),
	CONSTRAINT "recurrence_rules_frequency_check" CHECK(frequency IN ('daily', 'weekly', 'monthly', 'yearly'))
);
--> statement-breakpoint
INSERT INTO `__new_recurrence_rules`("id", "user_id", "type", "amount", "description", "category_id", "notes", "frequency", "is_subscription", "next_run_at", "end_date", "is_active", "created_at") SELECT "id", "user_id", "type", "amount", "description", "category_id", "notes", "frequency", "is_subscription", "next_run_at", "end_date", "is_active", "created_at" FROM `recurrence_rules`;--> statement-breakpoint
DROP TABLE `recurrence_rules`;--> statement-breakpoint
ALTER TABLE `__new_recurrence_rules` RENAME TO `recurrence_rules`;--> statement-breakpoint
CREATE TABLE `__new_transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`date` integer NOT NULL,
	`type` text NOT NULL,
	`amount` real NOT NULL,
	`description` text NOT NULL,
	`category_id` text,
	`notes` text,
	`recurrence_id` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`recurrence_id`) REFERENCES `recurrence_rules`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "transactions_type_check" CHECK(type IN ('income', 'expense'))
);
--> statement-breakpoint
INSERT INTO `__new_transactions`("id", "user_id", "date", "type", "amount", "description", "category_id", "notes", "recurrence_id", "created_at") SELECT "id", "user_id", "date", "type", "amount", "description", "category_id", "notes", "recurrence_id", "created_at" FROM `transactions`;--> statement-breakpoint
DROP TABLE `transactions`;--> statement-breakpoint
ALTER TABLE `__new_transactions` RENAME TO `transactions`;