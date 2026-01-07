-- Phase 1 Database Tables

CREATE TABLE IF NOT EXISTS `asset_categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(100) NOT NULL UNIQUE,
  `description` text,
  `icon` varchar(50),
  `status` enum('active','inactive') DEFAULT 'active',
  `display_order` int DEFAULT 0,
  `created_at` timestamp NULL,
  `updated_at` timestamp NULL,
  `deleted_at` timestamp NULL,
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `asset_depreciation` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `asset_id` bigint unsigned NOT NULL,
  `original_value` decimal(15,2) NOT NULL,
  `current_value` decimal(15,2) NOT NULL,
  `depreciation_rate` decimal(5,2) DEFAULT 0,
  `depreciation_method` enum('straight_line','declining_balance') DEFAULT 'straight_line',
  `useful_life_years` int DEFAULT 5,
  `depreciation_start_date` date NOT NULL,
  `annual_depreciation` decimal(15,2),
  `created_at` timestamp NULL,
  `updated_at` timestamp NULL,
  CONSTRAINT `asset_depreciation_ibfk_1` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE,
  KEY `asset_id` (`asset_id`),
  KEY `current_value` (`current_value`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `damage_types` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(100) NOT NULL UNIQUE,
  `description` text,
  `severity` enum('low','medium','high','critical') DEFAULT 'medium',
  `default_sla_hours` int DEFAULT 24,
  `color` varchar(20),
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL,
  `updated_at` timestamp NULL,
  `deleted_at` timestamp NULL,
  KEY `severity` (`severity`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ticket_attachments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `ticket_id` bigint unsigned NOT NULL,
  `uploaded_by` bigint unsigned,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_size` bigint NOT NULL,
  `mime_type` varchar(100),
  `notes` text,
  `status` enum('active','archived') DEFAULT 'active',
  `created_at` timestamp NULL,
  `updated_at` timestamp NULL,
  `deleted_at` timestamp NULL,
  CONSTRAINT `ticket_attachments_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE,
  KEY `ticket_id` (`ticket_id`),
  KEY `uploaded_by` (`uploaded_by`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `room_amenities` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(100) NOT NULL UNIQUE,
  `description` text,
  `icon` varchar(50),
  `status` enum('active','inactive') DEFAULT 'active',
  `display_order` int DEFAULT 0,
  `created_at` timestamp NULL,
  `updated_at` timestamp NULL,
  `deleted_at` timestamp NULL,
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `room_amenity_mapping` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `meeting_room_id` bigint unsigned NOT NULL,
  `room_amenity_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL,
  `updated_at` timestamp NULL,
  UNIQUE KEY `unique_room_amenity` (`meeting_room_id`, `room_amenity_id`),
  CONSTRAINT `room_amenity_mapping_ibfk_1` FOREIGN KEY (`meeting_room_id`) REFERENCES `meeting_rooms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `room_amenity_mapping_ibfk_2` FOREIGN KEY (`room_amenity_id`) REFERENCES `room_amenities` (`id`) ON DELETE CASCADE,
  KEY `meeting_room_id` (`meeting_room_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `room_booking_participants` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `meeting_room_booking_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `status` enum('invited','accepted','declined') DEFAULT 'invited',
  `responded_at` timestamp NULL,
  `notes` text,
  `created_at` timestamp NULL,
  `updated_at` timestamp NULL,
  UNIQUE KEY `unique_booking_participant` (`meeting_room_booking_id`, `user_id`),
  CONSTRAINT `room_booking_participants_ibfk_1` FOREIGN KEY (`meeting_room_booking_id`) REFERENCES `meeting_room_bookings` (`id`) ON DELETE CASCADE,
  KEY `user_id` (`user_id`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
