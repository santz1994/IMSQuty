<?php
/**
 * Asset API Feature Tests
 * Tests complete API workflows including authentication, validation, and database operations
 * Comprehensive endpoint coverage: list, show, create, update, delete
 * 
 * @file services/asset-service/tests/Feature/AssetControllerTest.php
 * @target 95%+ endpoint coverage, audit logging verification
 */

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Passport\Passport;
use Tests\TestCase;

class AssetControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Create authenticated users with different roles
        $this->user = User::factory()->create(['role' => 'user']);
        $this->adminUser = User::factory()->create(['role' => 'admin']);
    }

    /** @test */
    public function test_can_list_assets_with_authentication()
    {
        Passport::actingAs($this->user);
        Asset::factory()->count(5)->create();

        $response = $this->getJson('/api/assets');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => ['*' => ['id', 'name', 'serial_number', 'status']],
                'message'
            ])
            ->assertJsonCount(5, 'data');
    }

    /** @test */
    public function test_cannot_list_assets_without_authentication()
    {
        $response = $this->getJson('/api/assets');

        $response->assertStatus(401)
            ->assertJsonPath('success', false);
    }

    /** @test */
    public function test_list_assets_with_pagination()
    {
        Passport::actingAs($this->user);
        Asset::factory()->count(25)->create();

        $response = $this->getJson('/api/assets?page=2&per_page=10');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
                'pagination' => ['total', 'per_page', 'current_page', 'last_page']
            ])
            ->assertJsonCount(10, 'data');
    }

    /** @test */
    public function test_list_assets_with_filters()
    {
        Passport::actingAs($this->user);
        Asset::factory()->count(3)->state(['status' => 'active'])->create();
        Asset::factory()->count(2)->state(['status' => 'inactive'])->create();

        $response = $this->getJson('/api/assets?status=active');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    /** @test */
    public function test_can_show_single_asset()
    {
        Passport::actingAs($this->user);
        $asset = Asset::factory()->create(['name' => 'Server A']);

        $response = $this->getJson("/api/assets/{$asset->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Server A');
    }

    /** @test */
    public function test_show_nonexistent_asset_returns_404()
    {
        Passport::actingAs($this->user);

        $response = $this->getJson('/api/assets/99999');

        $response->assertStatus(404)
            ->assertJsonPath('success', false);
    }

    /** @test */
    public function test_can_create_asset_with_valid_data()
    {
        Passport::actingAs($this->adminUser);

        $data = [
            'name' => 'New Server',
            'asset_type_id' => 1,
            'serial_number' => 'SN-12345-NEW',
            'status' => 'active'
        ];

        $response = $this->postJson('/api/assets', $data);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Asset created successfully');

        $this->assertDatabaseHas('assets', $data);
    }

    /** @test */
    public function test_cannot_create_asset_with_missing_required_fields()
    {
        Passport::actingAs($this->adminUser);

        $response = $this->postJson('/api/assets', [
            'name' => '',
            'asset_type_id' => null
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonValidationErrors(['name', 'asset_type_id']);
    }

    /** @test */
    public function test_cannot_create_asset_with_duplicate_serial_number()
    {
        Passport::actingAs($this->adminUser);
        $existingAsset = Asset::factory()->create(['serial_number' => 'SN-DUPLICATE']);

        $response = $this->postJson('/api/assets', [
            'name' => 'New Server',
            'asset_type_id' => 1,
            'serial_number' => 'SN-DUPLICATE'
        ]);

        $response->assertStatus(409)
            ->assertJsonPath('success', false);
    }

    /** @test */
    public function test_non_admin_cannot_create_asset()
    {
        Passport::actingAs($this->user);

        $response = $this->postJson('/api/assets', [
            'name' => 'New Server',
            'asset_type_id' => 1,
            'serial_number' => 'SN-TEST'
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('success', false);
    }

    /** @test */
    public function test_can_update_asset_with_valid_data()
    {
        Passport::actingAs($this->adminUser);
        $asset = Asset::factory()->create();

        $updateData = [
            'name' => 'Updated Name',
            'status' => 'inactive'
        ];

        $response = $this->patchJson("/api/assets/{$asset->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Updated Name');

        $this->assertDatabaseHas('assets', [
            'id' => $asset->id,
            'status' => 'inactive'
        ]);
    }

    /** @test */
    public function test_cannot_update_nonexistent_asset()
    {
        Passport::actingAs($this->adminUser);

        $response = $this->patchJson('/api/assets/99999', ['name' => 'Test']);

        $response->assertStatus(404);
    }

    /** @test */
    public function test_can_delete_asset()
    {
        Passport::actingAs($this->adminUser);
        $asset = Asset::factory()->create();

        $response = $this->deleteJson("/api/assets/{$asset->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('assets', ['id' => $asset->id]);
    }

    /** @test */
    public function test_cannot_delete_asset_without_permission()
    {
        Passport::actingAs($this->user);
        $asset = Asset::factory()->create();

        $response = $this->deleteJson("/api/assets/{$asset->id}");

        $response->assertStatus(403);
    }

    /** @test */
    public function test_audit_log_created_on_asset_creation()
    {
        Passport::actingAs($this->adminUser);

        $data = [
            'name' => 'Audited Server',
            'asset_type_id' => 1,
            'serial_number' => 'SN-AUDIT'
        ];

        $this->postJson('/api/assets', $data);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $this->adminUser->id,
            'model_type' => 'Asset',
            'action' => 'created'
        ]);
    }

    /** @test */
    public function test_audit_log_created_on_asset_update()
    {
        Passport::actingAs($this->adminUser);
        $asset = Asset::factory()->create(['name' => 'Original Name']);

        $this->patchJson("/api/assets/{$asset->id}", ['name' => 'Updated Name']);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $this->adminUser->id,
            'model_type' => 'Asset',
            'action' => 'updated',
            'model_id' => $asset->id
        ]);
    }

    /** @test */
    public function test_audit_log_created_on_asset_deletion()
    {
        Passport::actingAs($this->adminUser);
        $asset = Asset::factory()->create();

        $this->deleteJson("/api/assets/{$asset->id}");

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $this->adminUser->id,
            'model_type' => 'Asset',
            'action' => 'deleted',
            'model_id' => $asset->id
        ]);
    }

    /** @test */
    public function test_response_format_is_consistent()
    {
        Passport::actingAs($this->user);
        Asset::factory()->create();

        $response = $this->getJson('/api/assets');

        $response->assertJsonStructure([
            'success',
            'data',
            'message',
            'timestamp'
        ]);
    }

    /** @test */
    public function test_error_response_format_is_consistent()
    {
        Passport::actingAs($this->user);

        $response = $this->getJson('/api/assets/nonexistent');

        $response->assertJsonStructure([
            'success',
            'error',
            'message',
            'timestamp'
        ]);
    }

    /** @test */
    public function test_invalid_token_returns_401()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer invalid-token'
        ])->getJson('/api/assets');

        $response->assertStatus(401);
    }

    /** @test */
    public function test_missing_authorization_header_returns_401()
    {
        $response = $this->getJson('/api/assets');

        $response->assertStatus(401);
    }
}

