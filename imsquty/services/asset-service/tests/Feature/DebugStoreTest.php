<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Asset;
use App\Models\AssetModel;
use App\Models\AssetType;
use App\Models\Status;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class DebugStoreTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_debug(): void
    {
        // Ensure test tables exist
        $this->ensureTestTables();
        $this->seedRoles();

        // Create authenticated user
        $user = User::factory()->create();

        // Create asset type
        $assetType = AssetType::create([
            'type_name' => 'Laptop',
            'abbreviation' => 'LPT',
            'spare' => false,
        ]);

        // Create status
        $status = Status::create([
            'name' => 'Available',
        ]);

        // Create asset model
        $assetModel = AssetModel::create([
            'asset_model' => 'Dell Latitude 7490',
            'asset_type_id' => $assetType->id,
        ]);

        // Try to create asset
        $assetData = [
            'asset_tag' => 'AST-DEBUG-001',
            'name' => 'Debug Laptop',
            'serial_number' => 'SN-DEBUG-123456',
            'model_id' => $assetModel->id,
            'status_id' => $status->id,
            'purchase_date' => '2024-01-15',
            'warranty_months' => 24,
        ];

        $response = $this->actingAs($user)->postJson('/api/v1/assets', $assetData);

        // Save full response to file for inspection
        file_put_contents(storage_path('debug_response.txt'), print_r($response->json(), true));

        $this->assertEquals(201, $response->status());
    }
}
