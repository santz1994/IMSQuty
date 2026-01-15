<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

use App\Models\Role;

echo "Testing role update...\n\n";

// Get role with ID 1
$role = Role::find(1);
if (!$role) {
    echo "Role not found\n";
    exit(1);
}

echo "Before update:\n";
echo "  Name: {$role->name}\n";
echo "  Display Name: {$role->display_name}\n";
echo "  Permissions: " . $role->permissions()->count() . "\n\n";

// Update with minimal data
try {
    $role->display_name = "Test Update " . time();
    $role->save();
    
    echo "After update:\n";
    echo "  Name: {$role->name}\n";
    echo "  Display Name: {$role->display_name}\n";
    echo "  Permissions: " . $role->permissions()->count() . "\n\n";
    
    echo "✓ Update successful\n";
} catch (\Exception $e) {
    echo "✗ Update failed: " . $e->getMessage() . "\n";
}

// Test syncPermissions
try {
    echo "\nTesting syncPermissions with [1,2,3]...\n";
    $role->syncPermissions([1,2,3]);
    $role->load('permissions');
    echo "Permissions after sync: " . $role->permissions->count() . "\n";
    echo "✓ syncPermissions successful\n";
} catch (\Exception $e) {
    echo "✗ syncPermissions failed: " . $e->getMessage() . "\n";
}
