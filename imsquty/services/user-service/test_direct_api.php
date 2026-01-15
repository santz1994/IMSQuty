<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

// Test direct controller call
$controller = new \App\Http\Controllers\RoleController();
$response = $controller->index();

// Get response content
$content = $response->getContent();
$data = json_decode($content, true);

echo "API Response Structure:\n";
echo "Success: " . ($data['success'] ? 'true' : 'false') . "\n";
echo "Message: " . $data['message'] . "\n";
echo "Data count: " . count($data['data']) . "\n\n";

echo "First 3 roles:\n";
foreach (array_slice($data['data'], 0, 3) as $role) {
    echo "\n{$role['name']}:\n";
    echo "  - permissions key exists: " . (isset($role['permissions']) ? 'YES' : 'NO') . "\n";
    if (isset($role['permissions'])) {
        echo "  - permissions type: " . gettype($role['permissions']) . "\n";
        echo "  - permissions count: " . (is_array($role['permissions']) ? count($role['permissions']) : 'N/A') . "\n";
        if (is_array($role['permissions']) && count($role['permissions']) > 0) {
            echo "  - first permission: " . $role['permissions'][0]['name'] . "\n";
        }
    }
}
