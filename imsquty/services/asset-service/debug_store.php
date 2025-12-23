<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Start fresh database
\DB::connection()->statement('DROP TABLE IF EXISTS assets');

// Run migrations
Artisan::call('migrate:fresh', ['--force' => true]);

// Create test data
$assetType = \App\Models\AssetType::create(['type_name' => 'Laptop', 'abbreviation' => 'LPT']);
$status = \App\Models\Status::create(['name' => 'Available']);
$model = \App\Models\AssetModel::create([
    'asset_type_id' => $assetType->id,
    'asset_model' => 'Dell Latitude 7490'
]);

// Try to create asset
try {
    $asset = \App\Models\Asset::create([
        'asset_tag' => 'AST-TEST-001',
        'name' => 'Test Laptop',
        'serial_number' => 'SN-TEST-123',
        'model_id' => $model->id,
        'status_id' => $status->id,
        'purchase_date' => '2024-01-15',
        'warranty_months' => 24,
    ]);
    echo "Asset created successfully: ID = " . $asset->id . "\n";
} catch (\Exception $e) {
    echo "Error creating asset: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
?>
