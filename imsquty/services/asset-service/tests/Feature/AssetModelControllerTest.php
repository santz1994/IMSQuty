<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\AssetModel;
use App\Models\AssetType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Spatie\Permission\Models\Role;

/**
 * AssetModel Controller Feature Tests
 * 
 * Tests all AssetModelController endpoints
 */
class AssetModelControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected AssetType $laptopType;
    protected AssetType $desktopType;
    protected User $authenticatedUser;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Seed RBAC tables for feature tests
        $this->seedRoles();
        
        // Create or get admin role and user for authentication
        $adminRole = Role::where('name', 'Admin')->where('guard_name', 'web')->first();
        $this->authenticatedUser = User::factory()->create([
            'name' => 'admin_test',
            'email' => 'admin@test.com',
        ]);
        $this->authenticatedUser->assignRole($adminRole);
        
        // Create asset types
        $this->laptopType = AssetType::create([
            'type_name' => 'Laptop',
            'abbreviation' => 'LPT',
            'spare' => false,
        ]);
        
        $this->desktopType = AssetType::create([
            'type_name' => 'Desktop',
            'abbreviation' => 'DSK',
            'spare' => false,
        ]);
    }

    /** @test */
    public function test_index_returnsAssetModelsList_withPagination(): void
    {
        // Arrange
        AssetModel::factory()->count(20)->create([
            'asset_type_id' => $this->laptopType->id,
        ]);
        
        // Act
        $response = $this->actingAs($this->authenticatedUser)
            ->getJson('/api/v1/asset-models');
        
        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'asset_model',
                            'asset_type_id',
                            'created_at',
                            'updated_at'
                        ]
                    ],
                    'current_page',
                    'per_page',
                    'total'
                ],
                'message'
            ]);
        
        $this->assertEquals(15, count($response->json('data.data'))); // Default per_page
    }

    /** @test */
    public function test_index_searchesAssetModels(): void
    {
        // Arrange
        AssetModel::factory()->create([
            'asset_model' => 'Dell Latitude 7490',
            'asset_type_id' => $this->laptopType->id,
        ]);
        AssetModel::factory()->count(5)->create([
            'asset_type_id' => $this->laptopType->id,
        ]);
        
        // Act
        $response = $this->getJson('/api/v1/asset-models?search=Latitude');
        
        // Assert
        $response->assertStatus(200);
        $models = $response->json('data.data');
        $this->assertGreaterThanOrEqual(1, count($models));
    }

    /** @test */
    public function test_show_returnsSingleAssetModel_withRelationships(): void
    {
        // Arrange
        $assetModel = AssetModel::factory()->create([
            'asset_type_id' => $this->laptopType->id,
        ]);
        
        // Act
        $response = $this->getJson("/api/v1/asset-models/{$assetModel->id}");
        
        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'asset_model',
                    'asset_type_id',
                    'asset_type' => [
                        'id',
                        'name',
                        'code'
                    ]
                ],
                'message'
            ]);
        
        $this->assertEquals($assetModel->id, $response->json('data.id'));
    }

    /** @test */
    public function test_show_returns404_whenAssetModelNotFound(): void
    {
        // Act
        $response = $this->getJson('/api/v1/asset-models/9999');
        
        // Assert
        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'error' => 'Asset model not found'
            ]);
    }

    /** @test */
    public function test_store_createsNewAssetModel_withValidData(): void
    {
        // Arrange
        $modelData = [
            'asset_model' => 'Dell Latitude 9510',
            'asset_type_id' => $this->laptopType->id,
            'manufacturer_id' => 1,
            'part_number' => 'PN-DELL-9510',
            'notes' => 'Business laptop with 5G support',
        ];
        
        // Act
        $response = $this->postJson('/api/v1/asset-models', $modelData);
        
        // Assert
        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Asset model created successfully'
            ])
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'asset_model',
                    'asset_type_id'
                ]
            ]);
        
        $this->assertDatabaseHas('asset_models', [
            'asset_model' => 'Dell Latitude 9510',
            'part_number' => 'PN-DELL-9510',
        ]);
    }

    /** @test */
    public function test_store_validatesRequiredFields(): void
    {
        // Arrange: Missing required fields
        $modelData = [
            'notes' => 'Incomplete model',
        ];
        
        // Act
        $response = $this->postJson('/api/v1/asset-models', $modelData);
        
        // Assert
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['asset_model', 'asset_type_id']);
    }

    /** @test */
    public function test_store_validatesUniqueAssetModel(): void
    {
        // Arrange: Create existing model
        $existingModel = AssetModel::factory()->create([
            'asset_model' => 'Duplicate Model',
            'asset_type_id' => $this->laptopType->id,
        ]);
        
        $modelData = [
            'asset_model' => 'Duplicate Model',
            'asset_type_id' => $this->laptopType->id,
        ];
        
        // Act
        $response = $this->postJson('/api/v1/asset-models', $modelData);
        
        // Assert
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['asset_model']);
    }

    /** @test */
    public function test_update_modifiesExistingAssetModel(): void
    {
        // Arrange
        $assetModel = AssetModel::factory()->create([
            'asset_type_id' => $this->laptopType->id,
        ]);
        
        $updateData = [
            'asset_model' => 'Updated Model Name',
            'notes' => 'Updated notes',
        ];
        
        // Act
        $response = $this->putJson("/api/v1/asset-models/{$assetModel->id}", $updateData);
        
        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Asset model updated successfully'
            ]);
        
        $this->assertDatabaseHas('asset_models', [
            'id' => $assetModel->id,
            'asset_model' => 'Updated Model Name',
            'notes' => 'Updated notes',
        ]);
    }

    /** @test */
    public function test_destroy_softDeletesAssetModel(): void
    {
        // Arrange
        $assetModel = AssetModel::factory()->create([
            'asset_type_id' => $this->laptopType->id,
        ]);
        
        // Act
        $response = $this->deleteJson("/api/v1/asset-models/{$assetModel->id}");
        
        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Asset model deleted successfully'
            ]);
        
        $this->assertSoftDeleted('asset_models', ['id' => $assetModel->id]);
    }

    /** @test */
    public function test_restore_recoversDeletedAssetModel(): void
    {
        // Arrange
        $assetModel = AssetModel::factory()->create([
            'asset_type_id' => $this->laptopType->id,
        ]);
        $assetModel->delete();
        
        // Act
        $response = $this->postJson("/api/v1/asset-models/{$assetModel->id}/restore");
        
        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Asset model restored successfully'
            ]);
        
        $this->assertDatabaseHas('asset_models', [
            'id' => $assetModel->id,
            'deleted_at' => null,
        ]);
    }

    /** @test */
    public function test_byType_returnsModelsForSpecificType(): void
    {
        // Arrange
        AssetModel::factory()->count(5)->create([
            'asset_type_id' => $this->laptopType->id,
        ]);
        AssetModel::factory()->count(3)->create([
            'asset_type_id' => $this->desktopType->id,
        ]);
        
        // Act
        $response = $this->getJson("/api/v1/asset-models/by-type/{$this->laptopType->id}");
        
        // Assert
        $response->assertStatus(200);
        $models = $response->json('data');
        $this->assertGreaterThanOrEqual(5, count($models));
        
        foreach ($models as $model) {
            $this->assertEquals($this->laptopType->id, $model['asset_type_id']);
        }
    }

    /** @test */
    public function test_byManufacturer_returnsModelsForSpecificManufacturer(): void
    {
        // Arrange
        $manufacturerId = 1; // Dell
        
        AssetModel::factory()->count(5)->create([
            'asset_type_id' => $this->laptopType->id,
            'manufacturer_id' => $manufacturerId,
        ]);
        AssetModel::factory()->count(3)->create([
            'asset_type_id' => $this->laptopType->id,
            'manufacturer_id' => 2, // HP
        ]);
        
        // Act
        $response = $this->getJson("/api/v1/asset-models/by-manufacturer/{$manufacturerId}");
        
        // Assert
        $response->assertStatus(200);
        $models = $response->json('data');
        $this->assertGreaterThanOrEqual(5, count($models));
        
        foreach ($models as $model) {
            $this->assertEquals($manufacturerId, $model['manufacturer_id']);
        }
    }

    /** @test */
    public function test_pagination_worksCorrectly(): void
    {
        // Arrange
        AssetModel::factory()->count(30)->create([
            'asset_type_id' => $this->laptopType->id,
        ]);
        
        // Act: Request page 2 with 10 per page
        $response = $this->getJson('/api/v1/asset-models?page=2&per_page=10');
        
        // Assert
        $response->assertStatus(200);
        $data = $response->json('data');
        
        $this->assertEquals(2, $data['current_page']);
        $this->assertEquals(10, $data['per_page']);
        $this->assertEquals(10, count($data['data']));
        $this->assertEquals(30, $data['total']);
    }
}
