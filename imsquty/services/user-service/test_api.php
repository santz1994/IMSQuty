<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

// Simulate API call
$roles = \Spatie\Permission\Models\Role::with('permissions')->withCount('users')->get();

echo "Total roles: " . $roles->count() . "\n\n";

foreach ($roles as $role) {
    echo "{$role->name}:\n";
    echo "  - permissions relation loaded: " . ($role->relationLoaded('permissions') ? 'YES' : 'NO') . "\n";
    echo "  - permissions count: " . $role->permissions->count() . "\n";
    echo "  - users count: " . ($role->users_count ?? 0) . "\n\n";
}

// Test Resource transformation
$resource = new \App\Http\Resources\RoleResource($roles->first());
$array = $resource->toArray(null);

echo "\nResource transformation:\n";
echo "  - name: {$array['name']}\n";
echo "  - permissions_count: {$array['permissions_count']}\n";
echo "  - permissions array count: " . count($array['permissions']) . "\n";
