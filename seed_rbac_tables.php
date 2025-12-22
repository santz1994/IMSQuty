<?php
/**
 * RBAC Seeding Script
 * Seeds Spatie Permission with default roles and permissions
 */

$pdo = new PDO('mysql:host=127.0.0.1;dbname=imsquty', 'root', '');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

echo "[*] Seeding RBAC tables...\n";

try {
    // Clear existing data
    echo "[*] Clearing existing RBAC data\n";
    $pdo->exec("DELETE FROM `role_has_permissions`");
    $pdo->exec("DELETE FROM `model_has_permissions`");
    $pdo->exec("DELETE FROM `model_has_roles`");
    $pdo->exec("DELETE FROM `roles`");
    $pdo->exec("DELETE FROM `permissions`");
    
    // Define all permissions
    $permissions = [
        // Assets
        'view-assets', 'create-asset', 'edit-asset', 'delete-asset', 'restore-asset', 'export-assets',
        'assign-asset', 'transfer-asset', 'schedule-maintenance',
        
        // Asset Models
        'view-asset-models', 'create-asset-model', 'edit-asset-model', 'delete-asset-model',
        
        // Master Data
        'view-divisions', 'create-division', 'edit-division', 'delete-division',
        'view-locations', 'create-location', 'edit-location', 'delete-location',
        'view-manufacturers', 'create-manufacturer', 'edit-manufacturer', 'delete-manufacturer',
        'view-suppliers', 'create-supplier', 'edit-supplier', 'delete-supplier',
        'view-warranty-types', 'create-warranty-type', 'edit-warranty-type', 'delete-warranty-type',
        'view-pc-specs', 'create-pc-spec', 'edit-pc-spec', 'delete-pc-spec',
        
        // Users
        'view-users', 'create-user', 'edit-user', 'delete-user', 'restore-user',
        
        // Tickets
        'view-tickets', 'create-ticket', 'edit-ticket', 'delete-ticket', 'restore-ticket',
        'assign-ticket', 'change-ticket-status', 'add-ticket-comment',
        
        // Meeting Rooms
        'view-meeting-rooms', 'create-meeting-room', 'edit-meeting-room', 'delete-meeting-room',
        'book-meeting-room', 'cancel-booking',
        
        // Inventory
        'view-inventory', 'edit-inventory', 'adjust-stock',
        
        // Financial
        'view-budgets', 'create-budget', 'edit-budget', 'delete-budget',
        'view-invoices', 'create-invoice', 'edit-invoice', 'delete-invoice',
        'view-expenses', 'create-expense', 'edit-expense', 'delete-expense',
        
        // Reporting
        'view-reports', 'generate-reports', 'export-reports',
        
        // Notifications
        'view-notifications', 'mark-notification-read',
        
        // Admin
        'view-audit-logs', 'manage-permissions', 'manage-users', 'system-settings'
    ];
    
    // Insert permissions
    $stmt = $pdo->prepare("INSERT INTO `permissions` (`name`, `guard_name`, `created_at`, `updated_at`) VALUES (?, 'web', NOW(), NOW())");
    foreach ($permissions as $permission) {
        $stmt->execute([$permission]);
    }
    echo "[✓] Created " . count($permissions) . " permissions\n";
    
    // Get all permission IDs
    $allPermissionsResult = $pdo->query("SELECT `id`, `name` FROM `permissions` ORDER BY `name`")->fetchAll(PDO::FETCH_ASSOC);
    $allPermissions = [];
    foreach ($allPermissionsResult as $row) {
        $allPermissions[$row['name']] = $row['id'];
    }
    
    // Define roles and their permissions
    $roles = [
        'admin' => array_values($allPermissions), // All permission IDs
        'manager' => [
            'view-assets', 'create-asset', 'edit-asset', 'assign-asset', 'transfer-asset',
            'view-asset-models', 'create-asset-model', 'edit-asset-model',
            'view-divisions', 'view-locations', 'view-manufacturers', 'view-suppliers',
            'view-users', 'view-tickets', 'assign-ticket', 'change-ticket-status',
            'view-meeting-rooms', 'book-meeting-room',
            'view-inventory', 'edit-inventory', 'adjust-stock',
            'view-budgets', 'view-invoices', 'view-expenses',
            'view-reports', 'generate-reports',
            'view-notifications', 'view-audit-logs'
        ],
        'user' => [
            'view-assets', 'view-asset-models',
            'view-divisions', 'view-locations', 'view-manufacturers', 'view-suppliers',
            'create-ticket', 'view-tickets', 'add-ticket-comment',
            'view-meeting-rooms', 'book-meeting-room', 'cancel-booking',
            'view-inventory',
            'view-notifications', 'mark-notification-read'
        ],
        'guest' => [
            'view-assets', 'view-meeting-rooms'
        ]
    ];
    
    // Insert roles and assign permissions
    foreach ($roles as $roleName => $permissionNames) {
        // Insert role
        $pdo->exec("INSERT INTO `roles` (`name`, `guard_name`, `created_at`, `updated_at`) VALUES ('$roleName', 'web', NOW(), NOW())");
        $roleId = $pdo->lastInsertId();
        
        // Assign permissions to role
        $insertStmt = $pdo->prepare("INSERT INTO `role_has_permissions` (`role_id`, `permission_id`) VALUES (?, ?)");
        foreach ($permissionNames as $permissionName) {
            if (isset($allPermissions[$permissionName])) {
                $insertStmt->execute([$roleId, $allPermissions[$permissionName]]);
            }
        }
        
        echo "[✓] Created role: $roleName with " . count($permissionNames) . " permissions\n";
    }
    
    echo "[✓] RBAC seeding completed successfully\n";
    
} catch (Exception $e) {
    echo "[✗] Error seeding RBAC: " . $e->getMessage() . "\n";
    exit(1);
}
