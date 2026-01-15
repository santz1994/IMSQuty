<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

use Spatie\Permission\Models\Permission;

echo "All available permissions:\n\n";

$permissions = Permission::orderBy('group')->orderBy('name')->get();

$groups = [];
foreach ($permissions as $perm) {
    if (!isset($groups[$perm->group])) {
        $groups[$perm->group] = [];
    }
    $groups[$perm->group][] = $perm->name;
}

foreach ($groups as $group => $perms) {
    echo "[$group]\n";
    foreach ($perms as $p) {
        echo "  - $p\n";
    }
    echo "\n";
}

echo "Total: " . $permissions->count() . " permissions\n";
