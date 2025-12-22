<?php

namespace Database\Factories;

use App\Models\InventoryItem;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

class InventoryItemFactory extends Factory
{
    protected $model = InventoryItem::class;

    public function definition(): array
    {
        return [
            'sku' => 'SKU-' . fake()->unique()->numberBetween(1000, 9999),
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'quantity' => fake()->numberBetween(0, 500),
            'min_quantity' => fake()->numberBetween(5, 50),
            'unit' => fake()->randomElement(['pcs', 'box', 'pack', 'unit']),
            'warehouse_id' => Warehouse::factory(),
            'created_by' => 1,
            'updated_by' => 1
        ];
    }

    public function lowStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'quantity' => 5,
            'min_quantity' => 20
        ]);
    }

    public function outOfStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'quantity' => 0
        ]);
    }
}
