<?php
/**
 * RBAC Tables Creation Script
 * Creates Spatie Permission tables in the shared database
 */

$pdo = new PDO('mysql:host=127.0.0.1;dbname=imsquty', 'root', '');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

echo "[*] Creating RBAC tables in shared database (imsquty)...\n";

try {
    $tableNumber = 0;
    
    // 1. Permissions table
    $tableNumber++;
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `permissions` (
            `id` bigint unsigned NOT NULL AUTO_INCREMENT,
            `name` varchar(255) NOT NULL,
            `guard_name` varchar(255) NOT NULL DEFAULT 'web',
            `created_at` timestamp NULL DEFAULT NULL,
            `updated_at` timestamp NULL DEFAULT NULL,
            PRIMARY KEY (`id`),
            UNIQUE KEY `permissions_name_guard_name_unique` (`name`, `guard_name`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "[✓] Table $tableNumber/5 created\n";
    
    // 2. Roles table
    $tableNumber++;
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `roles` (
            `id` bigint unsigned NOT NULL AUTO_INCREMENT,
            `name` varchar(255) NOT NULL,
            `guard_name` varchar(255) NOT NULL DEFAULT 'web',
            `created_at` timestamp NULL DEFAULT NULL,
            `updated_at` timestamp NULL DEFAULT NULL,
            PRIMARY KEY (`id`),
            UNIQUE KEY `roles_name_guard_name_unique` (`name`, `guard_name`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "[✓] Table $tableNumber/5 created\n";
    
    // 3. Model has permissions
    $tableNumber++;
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `model_has_permissions` (
            `permission_id` bigint unsigned NOT NULL,
            `model_type` varchar(255) NOT NULL,
            `model_id` bigint unsigned NOT NULL,
            PRIMARY KEY (`permission_id`, `model_id`, `model_type`),
            KEY `model_has_permissions_model_id_model_type_index` (`model_id`, `model_type`),
            CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "[✓] Table $tableNumber/5 created\n";
    
    // 4. Model has roles
    $tableNumber++;
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `model_has_roles` (
            `role_id` bigint unsigned NOT NULL,
            `model_type` varchar(255) NOT NULL,
            `model_id` bigint unsigned NOT NULL,
            PRIMARY KEY (`role_id`, `model_id`, `model_type`),
            KEY `model_has_roles_model_id_model_type_index` (`model_id`, `model_type`),
            CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "[✓] Table $tableNumber/5 created\n";
    
    // 5. Role has permissions
    $tableNumber++;
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `role_has_permissions` (
            `permission_id` bigint unsigned NOT NULL,
            `role_id` bigint unsigned NOT NULL,
            PRIMARY KEY (`permission_id`, `role_id`),
            KEY `role_has_permissions_role_id_foreign` (`role_id`),
            CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
            CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "[✓] Table $tableNumber/5 created\n";
    
    echo "[✓] RBAC tables created successfully\n";
    
} catch (Exception $e) {
    echo "[✗] Error creating RBAC tables: " . $e->getMessage() . "\n";
    exit(1);
}
