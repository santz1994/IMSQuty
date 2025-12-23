<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Asset;
use App\Models\AssetModel;
use App\Models\AssetType;
use App\Models\Status;
use App\Models\Movement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;

/**
 * Asset Controller Feature Tests
 * 
 * Tests all AssetController endpoints with authentication
 * Target: 80%+ code coverage
 */
class AssetControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $authenticatedUser;
    protected Status $availableStatus;
    protected Status $assignedStatus;
    protected AssetModel $assetModel;
    protected AssetType $assetType;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Ensure test tables exist (manufacturers, pcspecs, etc.)
        $this->ensureTestTables();
        
        // Seed RBAC tables for feature tests
        $this->seedRoles();
        
        // Create authenticated user using factory
        $this->authenticatedUser = User::factory()->create([
            'name' => 'testuser',
            'email' => 'test@quty.co.id',
        ]);
        
        // Create asset types
        $this->assetType = AssetType::create([
            'type_name' => 'Laptop',
            'abbreviation' => 'LPT',
            'spare' => false,
        ]);
        
        // Create statuses
        $this->availableStatus = Status::create([
            'name' => 'Available',
        ]);
        
        $this->assignedStatus = Status::create([
            'name' => 'Assigned',
        ]);
        
        // Create asset model
        $this->assetModel = AssetModel::create([
            'asset_model' => 'Dell Latitude 7490',
            'asset_type_id' => $this->assetType->id,
        ]);
    }

    /** @test */
    public function test_index_returnsAssetsList_withPagination(): void
    {
        // Arrange: Create test assets
        Asset::factory()->count(25)->create([
            'model_id' => $this->assetModel->id,
            'status_id' => $this->availableStatus->id,
        ]);
        
        // Act
        $response = $this->actingAs($this->authenticatedUser)->getJson('/api/v1/assets');
        
        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'asset_tag',
                            'name',
                            'serial_number',
                            'qr_code',
                            'status_id',
                            'created_at',
                            'updated_at'
                        ]
                    ],
                    'current_page',
                    'per_page',
                    'total',
                    'last_page'
                ],
                'message'
            ]);
        
        $this->assertEquals(15, count($response->json('data.data'))); // Default per_page
        $this->assertEquals(25, $response->json('data.total'));
    }

    /** @test */
    public function test_index_filtersAssetsByStatus(): void
    {
        // Arrange
        Asset::factory()->count(5)->create([
            'model_id' => $this->assetModel->id,
            'status_id' => $this->availableStatus->id,
        ]);
        Asset::factory()->count(3)->create([
            'model_id' => $this->assetModel->id,
            'status_id' => $this->assignedStatus->id,
            'assigned_to' => 2,
        ]);
        
        // Act
        $response = $this->actingAs($this->authenticatedUser)->getJson('/api/v1/assets?status_id=' . $this->availableStatus->id);
        
        // Assert
        $response->assertStatus(200);
        $assets = $response->json('data.data');
        $this->assertGreaterThanOrEqual(5, count($assets));
        
        foreach ($assets as $asset) {
            $this->assertEquals($this->availableStatus->id, $asset['status_id']);
        }
    }

    /** @test */
    public function test_index_searchesAssetsByTagOrName(): void
    {
        // Arrange
        Asset::factory()->create([
            'asset_tag' => 'AST-TEST-001',
            'name' => 'Test Dell Laptop',
            'model_id' => $this->assetModel->id,
            'status_id' => $this->availableStatus->id,
        ]);
        Asset::factory()->count(5)->create([
            'model_id' => $this->assetModel->id,
            'status_id' => $this->availableStatus->id,
        ]);
        
        // Act
        $response = $this->actingAs($this->authenticatedUser)->getJson('/api/v1/assets?search=TEST');
        
        // Assert
        $response->assertStatus(200);
        $assets = $response->json('data.data');
        $this->assertGreaterThanOrEqual(1, count($assets));
    }

    /** @test */
    public function test_show_returnsSingleAsset_withRelationships(): void
    {
        // Arrange
        $asset = Asset::factory()->create([
            'model_id' => $this->assetModel->id,
            'status_id' => $this->availableStatus->id,
        ]);
        
        // Act
        $response = $this->actingAs($this->authenticatedUser)->getJson("/api/v1/assets/{$asset->id}");
        
        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'asset_tag',
                    'name',
                    'serial_number',
                    'qr_code',
                    'asset_model' => [
                        'id',
                        'asset_model',
                        'asset_type_id'
                    ],
                    'status' => [
                        'id',
                        'name',
                        'code'
                    ]
                ],
                'message'
            ]);
        
        $this->assertEquals($asset->id, $response->json('data.id'));
        $this->assertEquals($asset->asset_tag, $response->json('data.asset_tag'));
    }

    /** @test */
    public function test_show_returns404_whenAssetNotFound(): void
    {
        // Act
        $response = $this->actingAs($this->authenticatedUser)->getJson('/api/v1/assets/9999');
        
        // Assert
        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'error' => 'Asset not found'
            ]);
    }

    /** @test */
    public function test_store_createsNewAsset_withValidData(): void
    {
        // Arrange
        $assetData = [
            'asset_tag' => 'AST-NEW-001',
            'name' => 'New Test Laptop',
            'serial_number' => 'SN-TEST-123456',
            'model_id' => $this->assetModel->id,
            'status_id' => $this->availableStatus->id,
            'purchase_date' => '2024-01-15',
            'warranty_months' => 24,
        ];
        
        // Act
        $response = $this->actingAs($this->authenticatedUser)->postJson('/api/v1/assets', $assetData);
        
        // Assert
        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Asset created successfully'
            ])
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'asset_tag',
                    'name',
                    'qr_code'
                ]
            ]);
        
        $this->assertDatabaseHas('assets', [
            'asset_tag' => 'AST-NEW-001',
            'name' => 'New Test Laptop',
        ]);
    }

    /** @test */
    public function test_store_validatesRequiredFields(): void
    {
        // Arrange: Missing required fields
        $assetData = [
            'name' => 'Incomplete Asset',
        ];
        
        // Act
        $response = $this->actingAs($this->authenticatedUser)->postJson('/api/v1/assets', $assetData);
        
        // Assert
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['asset_tag', 'model_id', 'status_id']);
    }

    /** @test */
    public function test_store_validatesUniqueAssetTag(): void
    {
        // Arrange: Create existing asset
        $existingAsset = Asset::factory()->create([
            'asset_tag' => 'AST-DUPLICATE',
            'model_id' => $this->assetModel->id,
            'status_id' => $this->availableStatus->id,
        ]);
        
        $assetData = [
            'asset_tag' => 'AST-DUPLICATE',
            'name' => 'Duplicate Tag Asset',
            'model_id' => $this->assetModel->id,
            'status_id' => $this->availableStatus->id,
        ];
        
        // Act
        $response = $this->actingAs($this->authenticatedUser)->postJson('/api/v1/assets', $assetData);
        
        // Assert
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['asset_tag']);
    }

    /** @test */
    public function test_update_modifiesExistingAsset(): void
    {
        // Arrange
        $asset = Asset::factory()->create([
            'model_id' => $this->assetModel->id,
            'status_id' => $this->availableStatus->id,
        ]);
        
        $updateData = [
            'name' => 'Updated Asset Name',
            'notes' => 'Updated notes',
        ];
        
        // Act
        $response = $this->actingAs($this->authenticatedUser)->putJson("/api/v1/assets/{$asset->id}", $updateData);
        
        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Asset updated successfully'
            ]);
        
        $this->assertDatabaseHas('assets', [
            'id' => $asset->id,
            'name' => 'Updated Asset Name',
            'notes' => 'Updated notes',
        ]);
    }

    /** @test */
    public function test_destroy_softDeletesAsset(): void
    {
        // Arrange
        $asset = Asset::factory()->create([
            'model_id' => $this->assetModel->id,
            'status_id' => $this->availableStatus->id,
        ]);
        
        // Act
        $response = $this->actingAs($this->authenticatedUser)->deleteJson("/api/v1/assets/{$asset->id}");
        
        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Asset deleted successfully'
            ]);
        
        $this->assertSoftDeleted('assets', ['id' => $asset->id]);
    }

    /** @test */
    public function test_restore_recoversDeletedAsset(): void
    {
        // Arrange
        $asset = Asset::factory()->create([
            'model_id' => $this->assetModel->id,
            'status_id' => $this->availableStatus->id,
        ]);
        $asset->delete();
        
        // Act
        $response = $this->actingAs($this->authenticatedUser)->postJson("/api/v1/assets/{$asset->id}/restore");
        
        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Asset restored successfully'
            ]);
        
        $this->assertDatabaseHas('assets', [
            'id' => $asset->id,
            'deleted_at' => null,
        ]);
    }

    /** @test */
    public function test_assign_assignsAssetToUser(): void
    {
        // Arrange
        $asset = Asset::factory()->create([
            'model_id' => $this->assetModel->id,
            'status_id' => $this->availableStatus->id,
            'assigned_to' => null,
        ]);
        
        $assignData = [
            'user_id' => 5,
            'location_id' => 10,
            'reason' => 'New employee assignment',
        ];
        
        // Act
        $response = $this->actingAs($this->authenticatedUser)->postJson("/api/v1/assets/{$asset->id}/assign", $assignData);
        
        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Asset assigned successfully'
            ]);
        
        $this->assertDatabaseHas('assets', [
            'id' => $asset->id,
            'assigned_to' => 5,
            'status_id' => $this->assignedStatus->id,
        ]);
        
        // Check movement created
        $this->assertDatabaseHas('movements', [
            'asset_id' => $asset->id,
            'to_user_id' => 5,
            'reason' => 'New employee assignment',
        ]);
    }

    /** @test */
    public function test_transfer_transfersAssetToNewLocation(): void
    {
        // Arrange
        $asset = Asset::factory()->create([
            'model_id' => $this->assetModel->id,
            'status_id' => $this->availableStatus->id,
            'location_id' => 5,
        ]);
        
        $transferData = [
            'to_location_id' => 10,
            'reason' => 'Office reorganization',
        ];
        
        // Act
        $response = $this->actingAs($this->authenticatedUser)->postJson("/api/v1/assets/{$asset->id}/transfer", $transferData);
        
        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Asset transferred successfully'
            ]);
        
        $this->assertDatabaseHas('assets', [
            'id' => $asset->id,
            'location_id' => 10,
        ]);
        
        // Check movement created
        $this->assertDatabaseHas('movements', [
            'asset_id' => $asset->id,
            'from_location_id' => 5,
            'to_location_id' => 10,
        ]);
    }

    /** @test */
    public function test_qrCode_findsAssetByQRCode(): void
    {
        // Arrange
        $asset = Asset::factory()->create([
            'qr_code' => 'QR-TEST-12345',
            'model_id' => $this->assetModel->id,
            'status_id' => $this->availableStatus->id,
        ]);
        
        // Act
        $response = $this->actingAs($this->authenticatedUser)->getJson('/api/v1/assets/qr/QR-TEST-12345');
        
        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $asset->id,
                    'qr_code' => 'QR-TEST-12345',
                ]
            ]);
    }

    /** @test */
    public function test_expiringWarranties_returnsAssetsWithSoonToExpireWarranties(): void
    {
        // Arrange: Create assets with expiring warranties
        Asset::factory()->count(3)->warrantyExpiring()->create([
            'model_id' => $this->assetModel->id,
            'status_id' => $this->availableStatus->id,
        ]);
        
        Asset::factory()->count(5)->create([
            'model_id' => $this->assetModel->id,
            'status_id' => $this->availableStatus->id,
            'purchase_date' => now()->subMonths(6),
            'warranty_months' => 36,
        ]);
        
        // Act
        $response = $this->actingAs($this->authenticatedUser)->getJson('/api/v1/assets/warranties/expiring?days=60');
        
        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'id',
                        'asset_tag',
                        'warranty_expiry_date'
                    ]
                ]
            ]);
    }

    /** @test */
    public function test_statistics_returnsAssetStats(): void
    {
        // Arrange
        Asset::factory()->count(10)->create([
            'model_id' => $this->assetModel->id,
            'status_id' => $this->availableStatus->id,
        ]);
        Asset::factory()->count(5)->create([
            'model_id' => $this->assetModel->id,
            'status_id' => $this->assignedStatus->id,
            'assigned_to' => 2,
        ]);
        
        // Act
        $response = $this->actingAs($this->authenticatedUser)->getJson('/api/v1/assets/statistics');
        
        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'total_assets',
                    'by_status',
                    'total_value',
                ]
            ]);
        
        $this->assertGreaterThanOrEqual(15, $response->json('data.total_assets'));
    }
}

