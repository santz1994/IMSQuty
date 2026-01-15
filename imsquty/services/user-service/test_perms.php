<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$role = \Spatie\Permission\Models\Role::with('permissions')->where('name', 'superadmin')->first();

echo "Superadmin permissions count: " . $role->permissions->count() . "\n";
echo "First 3 permissions:\n";
foreach ($role->permissions->take(3) as $perm) {
    echo "  - {$perm->name}\n";
}
