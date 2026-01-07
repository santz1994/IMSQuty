<?php

namespace App\Repositories;

use App\Models\InventoryItem;
use App\Models\StockMovement;
use Shared\Repositories\BaseRepository;

class InventoryRepository extends BaseRepository
{
    /**
     * Specify Model class name
     *
     * @return string
     */
    protected function model(): string
    {
        return InventoryItem::class;
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

    public function getStockMovements(int $itemId, int $perPage = 15)
    {
        return StockMovement::where('inventory_item_id', $itemId)
            ->with(['fromWarehouse', 'toWarehouse', 'item'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function getAll($perPage = 15, array $filters = [])
    {
        $query = $this->model::query()->with('warehouse');

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%")
                  ->orWhere('sku', 'like', "%{$filters['search']}%");
            });
        }

        if (isset($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (isset($filters['warehouse_id'])) {
            $query->where('warehouse_id', $filters['warehouse_id']);
        }

        if (isset($filters['low_stock']) && $filters['low_stock']) {
            $query->lowStock();
        }

        return $query->orderBy('name')->paginate($perPage);
    }

    public function adjustStock(int $itemId, string $type, int $quantity, array $details = []): bool
    {
        $item = $this->findById($itemId);
        if (!$item) return false;

        if ($type === 'increase') {
            $item->increment('quantity', $quantity);
        } else {
            if ($item->quantity < $quantity) return false;
            $item->decrement('quantity', $quantity);
        }

        StockMovement::create([
            'inventory_item_id' => $itemId,
            'movement_type' => StockMovement::TYPE_ADJUSTMENT,
            'quantity' => $type === 'increase' ? $quantity : -$quantity,
            'notes' => $details['reason'] ?? null,
            'reference_number' => $details['reference_number'] ?? null,
            'moved_by' => $details['moved_by'] ?? null,
            'moved_at' => now()
        ]);

        return true;
    }

    public function batchUpdateStock(array $items, string $movementType, array $details = []): array
    {
        $results = [];
        
        \DB::beginTransaction();
        try {
            foreach ($items as $itemData) {
                $item = $this->findById($itemData['inventory_item_id']);
                if (!$item) {
                    $results[] = [
                        'item_id' => $itemData['inventory_item_id'],
                        'success' => false,
                        'message' => 'Item not found'
                    ];
                    continue;
                }

                if ($movementType === StockMovement::TYPE_IN) {
                    $item->increment('quantity', $itemData['quantity']);
                } elseif ($movementType === StockMovement::TYPE_OUT) {
                    if ($item->quantity < $itemData['quantity']) {
                        $results[] = [
                            'item_id' => $itemData['inventory_item_id'],
                            'success' => false,
                            'message' => 'Insufficient stock'
                        ];
                        continue;
                    }
                    $item->decrement('quantity', $itemData['quantity']);
                }

                StockMovement::create([
                    'inventory_item_id' => $itemData['inventory_item_id'],
                    'movement_type' => $movementType,
                    'quantity' => $itemData['quantity'],
                    'notes' => $itemData['notes'] ?? $details['notes'] ?? null,
                    'reference_number' => $details['reference_number'] ?? null,
                    'moved_by' => $details['moved_by'] ?? null,
                    'moved_at' => now()
                ]);

                $results[] = [
                    'item_id' => $itemData['inventory_item_id'],
                    'success' => true,
                    'message' => 'Stock updated'
                ];
            }

            \DB::commit();
        } catch (\Exception $e) {
            \DB::rollBack();
            \Log::error('Batch stock update failed: ' . $e->getMessage());
            throw $e;
        }

        return $results;
    }

    public function getOutOfStock()
    {
        return InventoryItem::where('quantity', 0)->with('warehouse')->get();
    }

    public function getStockValuation(array $filters = []): array
    {
        $query = InventoryItem::query();

        if (isset($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (isset($filters['warehouse_id'])) {
            $query->where('warehouse_id', $filters['warehouse_id']);
        }

        $items = $query->get();

        return [
            'total_items' => $items->count(),
            'total_quantity' => $items->sum('quantity'),
            'total_value' => $items->sum(function ($item) {
                return $item->quantity * $item->unit_price;
            }),
            'by_category' => $items->groupBy('category')->map(function ($categoryItems) {
                return [
                    'count' => $categoryItems->count(),
                    'total_quantity' => $categoryItems->sum('quantity'),
                    'total_value' => $categoryItems->sum(function ($item) {
                        return $item->quantity * $item->unit_price;
                    })
                ];
            })
        ];
    }
}
