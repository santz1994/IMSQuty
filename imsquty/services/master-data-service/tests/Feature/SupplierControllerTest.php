<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;

class SupplierControllerTest extends TestCase
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
    public function it_can_list_all_suppliers()
    {
        Supplier::factory()->count(5)->create();

        $response = $this->getJson('/api/v1/suppliers');

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
    public function it_can_create_supplier()
    {
        $supplierData = [
            'name' => 'ABC Supplier',
            'code' => 'ABC001',
            'contact_person' => 'John Doe',
            'phone' => '+62-21-123456',
            'email' => 'contact@abc.com',
            'address' => '123 Main St',
            'city' => 'Jakarta',
            'country' => 'Indonesia',
            'is_active' => true
        ];

        $response = $this->postJson('/api/v1/suppliers', $supplierData);

        $response->assertStatus(201);

        $this->assertDatabaseHas('suppliers', [
            'name' => 'ABC Supplier',
            'code' => 'ABC001'
        ]);
    }

    /** @test */
    public function it_validates_required_fields()
    {
        $response = $this->postJson('/api/v1/suppliers', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'code']);
    }

    /** @test */
    public function it_validates_unique_code()
    {
        Supplier::factory()->create(['code' => 'SUP001']);

        $response = $this->postJson('/api/v1/suppliers', [
            'name' => 'Duplicate Supplier',
            'code' => 'SUP001'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['code']);
    }

    /** @test */
    public function it_can_show_single_supplier()
    {
        $supplier = Supplier::factory()->create();

        $response = $this->getJson("/api/v1/suppliers/{$supplier->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => ['id' => $supplier->id]
            ]);
    }

    /** @test */
    public function it_can_update_supplier()
    {
        $supplier = Supplier::factory()->create();

        $response = $this->putJson("/api/v1/suppliers/{$supplier->id}", [
            'name' => 'Updated Supplier',
            'code' => $supplier->code
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('suppliers', [
            'id' => $supplier->id,
            'name' => 'Updated Supplier'
        ]);
    }

    /** @test */
    public function it_can_delete_supplier()
    {
        $supplier = Supplier::factory()->create();

        $response = $this->deleteJson("/api/v1/suppliers/{$supplier->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('suppliers', ['id' => $supplier->id]);
    }

    /** @test */
    public function it_can_restore_supplier()
    {
        $supplier = Supplier::factory()->create();
        $supplier->delete();

        $response = $this->postJson("/api/v1/suppliers/{$supplier->id}/restore");

        $response->assertStatus(200);
        $this->assertDatabaseHas('suppliers', [
            'id' => $supplier->id,
            'deleted_at' => null
        ]);
    }

    /** @test */
    public function it_can_get_active_suppliers()
    {
        Supplier::factory()->create(['is_active' => true]);
        Supplier::factory()->create(['is_active' => false]);

        $response = $this->getJson('/api/v1/suppliers/active');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(1, $data);
    }

    /** @test */
    public function it_requires_authentication()
    {
        // Don't authenticate this request

        $response = $this->getJson('/api/v1/suppliers');

        $response->assertStatus(401);
    }
}
