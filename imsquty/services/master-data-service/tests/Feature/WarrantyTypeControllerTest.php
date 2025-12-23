<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\WarrantyType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;

class WarrantyTypeControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        Sanctum::actingAs($this->user);
    }

    /** @test */
    public function it_can_list_all_warranty_types()
    {
        WarrantyType::factory()->count(5)->create();

        $response = $this->getJson('/api/v1/warranty-types');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data' => ['*' => ['id', 'name', 'duration_months']],
                    'meta'
                ]
            ]);
    }

    /** @test */
    public function it_can_create_warranty_type()
    {
        $warrantyData = [
            'name' => '3 Year Warranty',
            'duration_months' => 36,
            'description' => 'Standard 3-year warranty',
            'is_active' => true
        ];

        $response = $this->postJson('/api/v1/warranty-types', $warrantyData);

        $response->assertStatus(201);

        $this->assertDatabaseHas('warranty_types', [
            'name' => '3 Year Warranty',
            'duration_months' => 36
        ]);
    }

    /** @test */
    public function it_validates_required_fields()
    {
        $response = $this->postJson('/api/v1/warranty-types', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'duration_months']);
    }

    /** @test */
    public function it_validates_duration_is_positive()
    {
        $response = $this->postJson('/api/v1/warranty-types', [
            'name' => 'Invalid Warranty',
            'duration_months' => -12
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['duration_months']);
    }

    /** @test */
    public function it_can_show_single_warranty_type()
    {
        $warrantyType = WarrantyType::factory()->create();

        $response = $this->getJson("/api/v1/warranty-types/{$warrantyType->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => ['id' => $warrantyType->id]
            ]);
    }

    /** @test */
    public function it_can_update_warranty_type()
    {
        $warrantyType = WarrantyType::factory()->create();

        $response = $this->putJson("/api/v1/warranty-types/{$warrantyType->id}", [
            'name' => 'Updated Warranty',
            'duration_months' => 24
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('warranty_types', [
            'id' => $warrantyType->id,
            'name' => 'Updated Warranty'
        ]);
    }

    /** @test */
    public function it_can_delete_warranty_type()
    {
        $warrantyType = WarrantyType::factory()->create();

        $response = $this->deleteJson("/api/v1/warranty-types/{$warrantyType->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('warranty_types', ['id' => $warrantyType->id]);
    }

    /** @test */
    public function it_can_restore_warranty_type()
    {
        $warrantyType = WarrantyType::factory()->create();
        $warrantyType->delete();

        $response = $this->postJson("/api/v1/warranty-types/{$warrantyType->id}/restore");

        $response->assertStatus(200);
        $this->assertDatabaseHas('warranty_types', [
            'id' => $warrantyType->id,
            'deleted_at' => null
        ]);
    }

    /** @test */
    public function it_can_get_active_warranty_types()
    {
        WarrantyType::factory()->create(['is_active' => true]);
        WarrantyType::factory()->create(['is_active' => false]);

        $response = $this->getJson('/api/v1/warranty-types/active');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(1, $data);
    }

    /** @test */
    public function it_requires_authentication()
    {
        // Don't authenticate this request

        $response = $this->getJson('/api/v1/warranty-types');

        $response->assertStatus(401);
    }
}
