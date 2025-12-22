<?php

// Seed RBAC tables script
require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

echo "[*] Seeding RBAC tables with default roles and permissions...\n";

// Clear existing data (disable FK checks)
DB::statement('SET FOREIGN_KEY_CHECKS=0');
DB::statement('TRUNCATE TABLE role_has_permissions');
DB::statement('TRUNCATE TABLE model_has_roles');
DB::statement('TRUNCATE TABLE model_has_permissions');
DB::statement('TRUNCATE TABLE roles');
DB::statement('TRUNCATE TABLE permissions');
DB::statement('SET FOREIGN_KEY_CHECKS=1');

echo "[*] Cleared existing RBAC data\n";

// Define permissions
$permissions = [
    // Asset Management
    'create-asset', 'read-asset', 'update-asset', 'delete-asset',
    'create-asset-model', 'read-asset-model', 'update-asset-model', 'delete-asset-model',
    
    // User Management
    'create-user', 'read-user', 'update-user', 'delete-user',
    
    // Ticket Management
    'create-ticket', 'read-ticket', 'update-ticket', 'delete-ticket',
    
    // Meeting Room Management
    'create-meeting-room', 'read-meeting-room', 'update-meeting-room', 'delete-meeting-room',
    'create-booking', 'read-booking', 'update-booking', 'delete-booking',
    
    // Inventory Management
    'create-inventory', 'read-inventory', 'update-inventory', 'delete-inventory',
    
    // Financial Management
    'create-budget', 'read-budget', 'update-budget', 'delete-budget',
    'create-invoice', 'read-invoice', 'update-invoice', 'delete-invoice',
    
    // Master Data Management
    'manage-divisions', 'manage-locations', 'manage-manufacturers', 'manage-suppliers',
    
    // Reporting
    'view-reports', 'export-reports',
    
    // System
    'manage-roles', 'manage-permissions', 'view-audit-logs'
];

// Create permissions
$permissionModels = [];
$permIndex = 1;
foreach ($permissions as $perm) {
    $id = $permIndex++;
    DB::table('permissions')->insert([
        'id' => $id,
        'name' => $perm,
        'guard_name' => 'sanctum',
        'created_at' => now(),
        'updated_at' => now()
    ]);
    $permissionModels[$perm] = $id;
}

echo "[✓] Created " . count($permissionModels) . " permissions\n";

// Define roles
$roles = [
    'admin' => array_keys($permissions), // Admin has all permissions
    'manager' => [
        'read-asset', 'update-asset', 'create-asset',
        'read-asset-model', 'update-asset-model',
        'read-user', 'update-user',
        'read-ticket', 'update-ticket',
        'read-meeting-room', 'create-booking', 'read-booking',
        'read-inventory', 'update-inventory',
        'read-budget', 'read-invoice',
        'view-reports', 'export-reports'
    ],
    'user' => [
        'read-asset',
        'create-ticket', 'read-ticket',
        'read-meeting-room', 'create-booking', 'read-booking',
        'read-inventory'
    ],
    'guest' => [
        'read-asset',
        'read-meeting-room'
    ]
];

// Create roles and assign permissions
$roleIndex = 1;
foreach ($roles as $roleName => $rolePermissions) {
    $roleId = $roleIndex++;
    DB::table('roles')->insert([
        'id' => $roleId,
        'name' => $roleName,
        'guard_name' => 'sanctum',
        'created_at' => now(),
        'updated_at' => now()
    ]);
    
    // Assign permissions to role
    foreach ($rolePermissions as $permName) {
        if (isset($permissionModels[$permName])) {
            DB::table('role_has_permissions')->insert([
                'permission_id' => $permissionModels[$permName],
                'role_id' => $roleId
            ]);
        }
    }
    
    echo "[✓] Created role: " . $roleName . " with " . count($rolePermissions) . " permissions\n";
}

echo "[✓] RBAC seeding completed successfully\n";
