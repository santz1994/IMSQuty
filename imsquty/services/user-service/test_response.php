<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

// Simulate exact API response
$roles = \Spatie\Permission\Models\Role::with('permissions')->withCount('users')->get();
$resource = \App\Http\Resources\RoleResource::collection($roles);

// Create fake request
$request = \Illuminate\Http\Request::create('/api/v1/roles', 'GET');

// Simulate Controller response
$response = [
    'success' => true,
    'message' => 'Roles retrieved successfully',
    'data' => $resource->toArray($request)
];

echo json_encode($response, JSON_PRETTY_PRINT);
