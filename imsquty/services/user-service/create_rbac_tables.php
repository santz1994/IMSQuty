<?php

// Create RBAC tables script
require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$tables = [
    'CREATE TABLE IF NOT EXISTS `permissions` (
        `id` bigint unsigned NOT NULL AUTO_INCREMENT,
        `name` varchar(125) NOT NULL,
        `guard_name` varchar(125) NOT NULL,
        `created_at` timestamp NULL DEFAULT NULL,
        `updated_at` timestamp NULL DEFAULT NULL,
        PRIMARY KEY (`id`),
        UNIQUE KEY `permissions_name_guard_name_unique` (`name`,`guard_name`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
    
    'CREATE TABLE IF NOT EXISTS `roles` (
        `id` bigint unsigned NOT NULL AUTO_INCREMENT,
        `name` varchar(125) NOT NULL,
        `guard_name` varchar(125) NOT NULL,
        `created_at` timestamp NULL DEFAULT NULL,
        `updated_at` timestamp NULL DEFAULT NULL,
        PRIMARY KEY (`id`),
        UNIQUE KEY `roles_name_guard_name_unique` (`name`,`guard_name`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
    
    'CREATE TABLE IF NOT EXISTS `model_has_permissions` (
        `permission_id` bigint unsigned NOT NULL,
        `model_type` varchar(255) NOT NULL,
        `model_id` bigint unsigned NOT NULL,
        PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
        KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`),
        CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
    
    'CREATE TABLE IF NOT EXISTS `model_has_roles` (
        `role_id` bigint unsigned NOT NULL,
        `model_type` varchar(255) NOT NULL,
        `model_id` bigint unsigned NOT NULL,
        PRIMARY KEY (`role_id`,`model_id`,`model_type`),
        KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`),
        CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
    
    'CREATE TABLE IF NOT EXISTS `role_has_permissions` (
        `permission_id` bigint unsigned NOT NULL,
        `role_id` bigint unsigned NOT NULL,
        PRIMARY KEY (`permission_id`,`role_id`),
        KEY `role_has_permissions_role_id_foreign` (`role_id`),
        CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
        CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
];

echo "[*] Creating RBAC tables in shared database (imsquty)...\n";

foreach ($tables as $index => $sql) {
    try {
        DB::statement($sql);
        echo "[✓] Table " . ($index + 1) . "/5 created\n";
    } catch (\Exception $e) {
        echo "[!] Error on table " . ($index + 1) . ": " . $e->getMessage() . "\n";
    }
}

echo "[✓] RBAC tables created successfully on imsquty database\n";
