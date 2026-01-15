<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

echo "Setting up permissions for roles...\n\n";

// Developer role - full development access
$developer = Role::where('name', 'developer')->first();
if ($developer) {
    echo "Configuring Developer role...\n";
    
    $devPermissions = Permission::where(function($q) {
        $q->where('name', 'like', 'system.%')
          ->orWhere('name', 'like', 'users.%')
          ->orWhere('name', 'like', 'roles.%')
          ->orWhere('name', 'like', 'permissions.%')
          ->orWhere('name', 'like', 'assets.%')
          ->orWhere('name', 'like', 'settings.%')
          ->orWhere('name', 'like', 'audit.%');
    })->pluck('name')->toArray();
    
    $developer->syncPermissions($devPermissions);
    echo "  ✓ Assigned " . count($devPermissions) . " permissions to Developer\n\n";
}

// Receptionist role - meeting room management
$receptionist = Role::where('name', 'receptionist')->first();
if ($receptionist) {
    echo "Configuring Receptionist role...\n";
    
    // Receptionist needs: dashboard view, meeting rooms, bookings, approvals
    $recepPermissions = [
        'dashboard.view',
        'meetingrooms.view',
        'meetingrooms.create', 
        'meetingrooms.edit',
        'meetingrooms.delete',
        'bookings.view',
        'bookings.create',
        'bookings.edit',
        'bookings.approve',
        'bookings.reject',
        'bookings.cancel',
    ];
    
    // Get permissions that exist
    $existingPerms = Permission::whereIn('name', $recepPermissions)->pluck('name')->toArray();
    
    $receptionist->syncPermissions($existingPerms);
    echo "  ✓ Assigned " . count($existingPerms) . " permissions to Receptionist\n";
    echo "  Permissions: " . implode(', ', $existingPerms) . "\n\n";
}

// Show summary for all roles
echo "\n=== SUMMARY ===\n";
$roles = Role::with('permissions')->get();
foreach ($roles as $role) {
    echo "{$role->display_name}: {$role->permissions->count()} permissions\n";
}

echo "\n✓ Configuration complete!\n";
