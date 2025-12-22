<?php

namespace Tests\Feature;

use App\Models\InventoryItem;
use App\Models\Warehouse;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventoryTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
    }

    /** @test */
    public function it_can_list_inventory_items()
    {
        InventoryItem::factory()->count(5)->create();

        $response = $this->getJson('/api/v1/inventory');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data' => [
                        '*' => ['id', 'sku', 'name', 'quantity']
                    ]
                ],
                'message'
            ]);
    }

    /** @test */
    public function it_can_create_inventory_item()
    {
        $warehouse = Warehouse::factory()->create();

        $data = [
            'sku' => 'TEST-001',
            'name' => 'Test Item',
            'description' => 'Test description',
            'quantity' => 100,
            'min_quantity' => 10,
            'unit' => 'PCS',
            'warehouse_id' => $warehouse->id
        ];

        $response = $this->postJson('/api/v1/inventory', $data);

        $response->assertStatus(201);

        $this->assertDatabaseHas('inventory_items', [
            'sku' => 'TEST-001',
            'name' => 'Test Item'
        ]);
    }

    /** @test */
    public function it_can_show_inventory_item()
    {
        $item = InventoryItem::factory()->create();

        $response = $this->getJson("/api/v1/inventory/{$item->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $item->id,
                    'sku' => $item->sku
                ]
            ]);
    }

    /** @test */
    public function it_can_update_inventory_item()
    {
        $item = InventoryItem::factory()->create();

        $data = ['name' => 'Updated Name'];

        $response = $this->putJson("/api/v1/inventory/{$item->id}", $data);

        $response->assertStatus(200);

        $this->assertDatabaseHas('inventory_items', [
            'id' => $item->id,
            'name' => 'Updated Name'
        ]);
    }

    /** @test */
    public function it_can_delete_inventory_item()
    {
        $item = InventoryItem::factory()->create();

        $response = $this->deleteJson("/api/v1/inventory/{$item->id}");

        $response->assertStatus(200);

        $this->assertSoftDeleted('inventory_items', [
            'id' => $item->id
        ]);
    }

    /** @test */
    public function it_can_add_stock()
    {
        $item = InventoryItem::factory()->create(['quantity' => 50]);

        $response = $this->postJson("/api/v1/inventory/{$item->id}/add-stock", [
            'quantity' => 25,
            'notes' => 'Restocking'
        ]);

        $response->assertStatus(200);

        $item->refresh();
        $this->assertEquals(75, $item->quantity);
    }

    /** @test */
    public function it_can_reduce_stock()
    {
        $item = InventoryItem::factory()->create(['quantity' => 50]);

        $response = $this->postJson("/api/v1/inventory/{$item->id}/reduce-stock", [
            'quantity' => 20,
            'notes' => 'Usage'
        ]);

        $response->assertStatus(200);

        $item->refresh();
        $this->assertEquals(30, $item->quantity);
    }

    /** @test */
    public function it_cannot_reduce_more_than_available()
    {
        $item = InventoryItem::factory()->create(['quantity' => 10]);

        $response = $this->postJson("/api/v1/inventory/{$item->id}/reduce-stock", [
            'quantity' => 20
        ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function it_can_transfer_stock()
    {
        $from = Warehouse::factory()->create();
        $to = Warehouse::factory()->create();
        $item = InventoryItem::factory()->create([
            'warehouse_id' => $from->id,
            'quantity' => 50
        ]);

        $response = $this->postJson("/api/v1/inventory/{$item->id}/transfer", [
            'to_warehouse_id' => $to->id,
            'quantity' => 25
        ]);

        $response->assertStatus(200);
    }

    /** @test */
    public function it_can_get_low_stock_items()
    {
        InventoryItem::factory()->create([
            'quantity' => 5,
            'min_quantity' => 10
        ]);

        $response = $this->getJson('/api/v1/inventory/low-stock');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.data');
    }
}
