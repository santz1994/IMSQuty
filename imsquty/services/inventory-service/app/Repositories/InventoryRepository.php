<?php

namespace App\Repositories;

use App\Models\InventoryItem;
use App\Models\StockMovement;

class InventoryRepository
{
    public function getAll(int $perPage = 15, array $filters = [])
    {
        $query = InventoryItem::with('warehouse');

        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (!empty($filters['search'])) {
            $query->where(function($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%")
                  ->orWhere('code', 'like', "%{$filters['search']}%");
            });
        }

        return $query->latest()->paginate($perPage);
    }

    public function findById(int $id): ?InventoryItem
    {
        return InventoryItem::with('warehouse', 'movements')->find($id);
    }

    public function create(array $data): InventoryItem
    {
        return InventoryItem::create($data);
    }

    public function update(int $id, array $data): bool
    {
        $item = $this->findById($id);
        return $item ? $item->update($data) : false;
    }

    public function delete(int $id): bool
    {
        $item = $this->findById($id);
        return $item ? $item->delete() : false;
    }

    public function getLowStock()
    {
        return InventoryItem::lowStock()->with('warehouse')->get();
    }

    public function addStock(int $itemId, int $quantity, array $details = []): bool
    {
        $item = $this->findById($itemId);
        if (!$item) return false;

        $item->increment('quantity', $quantity);

        StockMovement::create([
            'inventory_item_id' => $itemId,
            'movement_type' => StockMovement::TYPE_IN,
            'quantity' => $quantity,
            'notes' => $details['notes'] ?? null,
            'moved_by' => $details['moved_by'] ?? null
        ]);

        return true;
    }

    public function reduceStock(int $itemId, int $quantity, array $details = []): bool
    {
        $item = $this->findById($itemId);
        if (!$item || $item->quantity < $quantity) return false;

        $item->decrement('quantity', $quantity);

        StockMovement::create([
            'inventory_item_id' => $itemId,
            'movement_type' => StockMovement::TYPE_OUT,
            'quantity' => $quantity,
            'notes' => $details['notes'] ?? null,
            'moved_by' => $details['moved_by'] ?? null
        ]);

        return true;
    }

    public function getStatistics(): array
    {
        return [
            'total_items' => InventoryItem::count(),
            'low_stock_items' => InventoryItem::lowStock()->count(),
            'total_value' => InventoryItem::sum(\DB::raw('quantity * unit_price')),
            'by_category' => InventoryItem::selectRaw('category, COUNT(*) as count')
                                        ->groupBy('category')
                                        ->pluck('count', 'category')
                                        ->toArray()
        ];
    }

    public function transferStock(int $itemId, int $toWarehouseId, int $quantity, array $details = []): bool
    {
        $item = $this->findById($itemId);
        if (!$item || $item->quantity < $quantity) return false;

        $item->decrement('quantity', $quantity);

        StockMovement::create([
            'inventory_item_id' => $itemId,
            'movement_type' => StockMovement::TYPE_TRANSFER,
            'quantity' => $quantity,
            'from_warehouse_id' => $item->warehouse_id,
            'to_warehouse_id' => $toWarehouseId,
            'notes' => $details['notes'] ?? null,
            'moved_by' => $details['moved_by'] ?? null
        ]);

        return true;
    }
}
