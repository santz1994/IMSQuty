<?php

namespace Database\Seeders;

use App\Models\InventoryItem;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    public function run(): void
    {
        // Create warehouses
        $mainWarehouse = Warehouse::factory()->create([
            'name' => 'Main Warehouse',
            'code' => 'WH-MAIN',
            'location' => 'Jakarta HQ'
        ]);

        $branchWarehouse = Warehouse::factory()->create([
            'name' => 'Branch Warehouse',
            'code' => 'WH-BRANCH',
            'location' => 'Surabaya Office'
        ]);

        // Create inventory items
        InventoryItem::factory()->count(20)->create([
            'warehouse_id' => $mainWarehouse->id
        ]);

        InventoryItem::factory()->count(10)->create([
            'warehouse_id' => $branchWarehouse->id
        ]);

        // Create low stock items
        InventoryItem::factory()->count(3)->lowStock()->create([
            'warehouse_id' => $mainWarehouse->id
        ]);

        // Create out of stock items
        InventoryItem::factory()->count(2)->outOfStock()->create([
            'warehouse_id' => $mainWarehouse->id
        ]);
    }
}
