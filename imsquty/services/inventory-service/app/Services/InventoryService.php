<?php

namespace App\Services;

use App\Repositories\InventoryRepository;

class InventoryService
{
    public function __construct(private InventoryRepository $repository) {}

    public function getAll(int $perPage = 15, array $filters = [])
    {
        return $this->repository->getAll($perPage, $filters);
    }

    public function getById(int $id)
    {
        return $this->repository->findById($id);
    }

    public function create(array $data)
    {
        $data['created_by'] = auth()->id();
        return $this->repository->create($data);
    }

    public function update(int $id, array $data): bool
    {
        $data['updated_by'] = auth()->id();
        return $this->repository->update($id, $data);
    }

    public function delete(int $id): bool
    {
        return $this->repository->delete($id);
    }

    public function getLowStock()
    {
        return $this->repository->getLowStock();
    }

    public function getOutOfStock()
    {
        return $this->repository->getOutOfStock();
    }

    public function addStock(int $itemId, int $quantity, array $details = []): bool
    {
        $details['moved_by'] = auth()->id();
        return $this->repository->addStock($itemId, $quantity, $details);
    }

    public function reduceStock(int $itemId, int $quantity, array $details = []): bool
    {
        $details['moved_by'] = auth()->id();
        return $this->repository->reduceStock($itemId, $quantity, $details);
    }

    public function getStatistics(): array
    {
        return $this->repository->getStatistics();
    }

    public function transferStock(int $itemId, int $toWarehouseId, int $quantity, array $details = []): bool
    {
        $details['moved_by'] = auth()->id();
        return $this->repository->transferStock($itemId, $toWarehouseId, $quantity, $details);
    }

    public function getStockMovements(int $itemId, int $perPage = 15)
    {
        return $this->repository->getStockMovements($itemId, $perPage);
    }

    public function adjustStock(int $itemId, string $type, int $quantity, array $details = []): bool
    {
        $details['moved_by'] = auth()->id();
        return $this->repository->adjustStock($itemId, $type, $quantity, $details);
    }

    public function batchUpdateStock(array $items, string $movementType, array $details = []): array
    {
        $details['moved_by'] = auth()->id();
        return $this->repository->batchUpdateStock($items, $movementType, $details);
    }

    public function getStockValuation(array $filters = []): array
    {
        return $this->repository->getStockValuation($filters);
    }

    public function getDetailedStatistics(): array
    {
        $basic = $this->getStatistics();
        $valuation = $this->getStockValuation();

        return [
            'inventory_summary' => $basic,
            'stock_valuation' => $valuation,
            'low_stock_count' => $basic['low_stock_items'],
            'out_of_stock_count' => $this->repository->getOutOfStock()->count(),
            'total_inventory_value' => $valuation['total_value']
        ];
    }
}
