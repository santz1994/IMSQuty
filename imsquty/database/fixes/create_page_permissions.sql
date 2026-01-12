-- Create Pages Table
CREATE TABLE
IF NOT EXISTS `pages`
(
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `path` varchar
(100) NOT NULL COMMENT 'Route path e.g. /assets, /tickets',
  `name` varchar
(100) NOT NULL COMMENT 'Display name',
  `module` varchar
(50) NOT NULL COMMENT 'Module group: Assets, Tickets, etc',
  `icon` varchar
(50) DEFAULT NULL COMMENT 'MUI icon name',
  `description` text,
  `is_active` tinyint
(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY
(`id`),
  UNIQUE KEY `pages_path_unique`
(`path`),
  KEY `pages_module_index`
(`module`),
  KEY `pages_is_active_index`
(`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Role-Page Permissions Junction Table
CREATE TABLE
IF NOT EXISTS `role_page_permissions`
(
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `role_id` bigint unsigned NOT NULL,
  `page_id` bigint unsigned NOT NULL,
  `can_access` tinyint
(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY
(`id`),
  UNIQUE KEY `role_page_permissions_role_id_page_id_unique`
(`role_id`,`page_id`),
  KEY `role_page_permissions_role_id_index`
(`role_id`),
  KEY `role_page_permissions_page_id_index`
(`page_id`),
  CONSTRAINT `role_page_permissions_role_id_foreign` FOREIGN KEY
(`role_id`) REFERENCES `roles`
(`id`) ON
DELETE CASCADE,
  CONSTRAINT `role_page_permissions_page_id_foreign` FOREIGN KEY
(`page_id`) REFERENCES `pages`
(`id`) ON
DELETE CASCADE
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Default Pages
INSERT INTO `pages` (`
path`,
`name
`, `module`, `icon`, `sort_order`, `created_at`, `updated_at`) VALUES
('/dashboard', 'Dashboard', 'Core', 'Dashboard', 1, NOW
(), NOW
()),
('/assets', 'Asset List', 'Assets', 'Inventory', 10, NOW
(), NOW
()),
('/assets/create', 'Create Asset', 'Assets', 'Add', 11, NOW
(), NOW
()),
('/assets/:id', 'Asset Detail', 'Assets', 'Info', 12, NOW
(), NOW
()),
('/tickets', 'Ticket List', 'Tickets', 'ConfirmationNumber', 20, NOW
(), NOW
()),
('/tickets/create', 'Create Ticket', 'Tickets', 'Add', 21, NOW
(), NOW
()),
('/tickets/:id', 'Ticket Detail', 'Tickets', 'Info', 22, NOW
(), NOW
()),
('/inventory', 'Inventory List', 'Inventory', 'Warehouse', 30, NOW
(), NOW
()),
('/financial', 'Financial Records', 'Financial', 'AttachMoney', 40, NOW
(), NOW
()),
('/meeting-rooms', 'Meeting Rooms', 'Meeting Rooms', 'MeetingRoom', 50, NOW
(), NOW
()),
('/meeting-rooms/calendar', 'Booking Calendar', 'Meeting Rooms', 'CalendarMonth', 51, NOW
(), NOW
()),
('/meeting-rooms/approvals', 'Booking Approvals', 'Meeting Rooms', 'CheckCircle', 52, NOW
(), NOW
()),
('/meeting-rooms/receptionist', 'Receptionist Panel', 'Meeting Rooms', 'AdminPanelSettings', 53, NOW
(), NOW
()),
('/reports', 'Reports', 'Reports', 'Assessment', 60, NOW
(), NOW
()),
('/notifications', 'Notifications', 'Core', 'Notifications', 70, NOW
(), NOW
()),
('/settings', 'Settings', 'Core', 'Settings', 80, NOW
(), NOW
()),
('/admin/users', 'User Management', 'Admin', 'People', 90, NOW
(), NOW
()),
('/admin/roles', 'Roles & Permissions', 'Admin', 'Security', 91, NOW
(), NOW
()),
('/admin/page-permissions', 'Page Permissions', 'Admin', 'Lock', 92, NOW
(), NOW
()),
('/admin/audit-logs', 'Audit Logs', 'Admin', 'History', 93, NOW
(), NOW
()),
('/admin/system-settings', 'System Settings', 'Admin', 'Settings', 94, NOW
(), NOW
());
