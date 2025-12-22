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
        return $this->repository->create($data);
    }

    public function update(int $id, array $data): bool
    {
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

    public function addStock(int $itemId, int $quantity, array $details = []): bool
    {
        return $this->repository->addStock($itemId, $quantity, $details);
    }

    public function reduceStock(int $itemId, int $quantity, array $details = []): bool
    {
        return $this->repository->reduceStock($itemId, $quantity, $details);
    }

    public function getStatistics(): array
    {
        return $this->repository->getStatistics();
    }

    public function transferStock(int $itemId, int $toWarehouseId, int $quantity, array $details = []): bool
    {
        return $this->repository->transferStock($itemId, $toWarehouseId, $quantity, $details);
    }
}
