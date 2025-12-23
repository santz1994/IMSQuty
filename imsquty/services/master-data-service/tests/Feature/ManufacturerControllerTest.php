<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Manufacturer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;

class ManufacturerControllerTest extends TestCase
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
    public function it_can_list_all_manufacturers()
    {
        Manufacturer::factory()->count(5)->create();

        $response = $this->getJson('/api/v1/manufacturers');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data' => ['*' => ['id', 'name', 'code']],
                    'meta'
                ]
            ]);
    }

    /** @test */
    public function it_can_create_manufacturer()
    {
        $manufacturerData = [
            'name' => 'Dell Inc',
            'code' => 'DELL',
            'website' => 'https://dell.com',
            'support_email' => 'support@dell.com',
            'support_phone' => '+1-800-DELL',
            'is_active' => true
        ];

        $response = $this->postJson('/api/v1/manufacturers', $manufacturerData);

        $response->assertStatus(201);

        $this->assertDatabaseHas('manufacturers', [
            'name' => 'Dell Inc',
            'code' => 'DELL'
        ]);
    }

    /** @test */
    public function it_validates_required_fields()
    {
        $response = $this->postJson('/api/v1/manufacturers', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'code']);
    }

    /** @test */
    public function it_validates_unique_code()
    {
        Manufacturer::factory()->create(['code' => 'HP']);

        $response = $this->postJson('/api/v1/manufacturers', [
            'name' => 'HP Inc',
            'code' => 'HP'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['code']);
    }

    /** @test */
    public function it_can_show_single_manufacturer()
    {
        $manufacturer = Manufacturer::factory()->create();

        $response = $this->getJson("/api/v1/manufacturers/{$manufacturer->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => ['id' => $manufacturer->id]
            ]);
    }

    /** @test */
    public function it_can_update_manufacturer()
    {
        $manufacturer = Manufacturer::factory()->create();

        $response = $this->putJson("/api/v1/manufacturers/{$manufacturer->id}", [
            'name' => 'Updated Name',
            'code' => $manufacturer->code
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('manufacturers', [
            'id' => $manufacturer->id,
            'name' => 'Updated Name'
        ]);
    }

    /** @test */
    public function it_can_delete_manufacturer()
    {
        $manufacturer = Manufacturer::factory()->create();

        $response = $this->deleteJson("/api/v1/manufacturers/{$manufacturer->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('manufacturers', ['id' => $manufacturer->id]);
    }

    /** @test */
    public function it_can_restore_manufacturer()
    {
        $manufacturer = Manufacturer::factory()->create();
        $manufacturer->delete();

        $response = $this->postJson("/api/v1/manufacturers/{$manufacturer->id}/restore");

        $response->assertStatus(200);
        $this->assertDatabaseHas('manufacturers', [
            'id' => $manufacturer->id,
            'deleted_at' => null
        ]);
    }

    /** @test */
    public function it_can_get_active_manufacturers()
    {
        Manufacturer::factory()->create(['is_active' => true]);
        Manufacturer::factory()->create(['is_active' => false]);

        $response = $this->getJson('/api/v1/manufacturers/active');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(1, $data);
    }

    /** @test */
    public function it_requires_authentication()
    {
        // Don't authenticate this request

        $response = $this->getJson('/api/v1/manufacturers');

        $response->assertStatus(401);
    }
}
