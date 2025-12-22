<?php

namespace App\Repositories;

use App\Models\WarrantyType;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class WarrantyTypeRepository
{
    /**
     * Create a new warranty type.
     *
     * @param array $data
     * @return WarrantyType
     */
    public function create(array $data): WarrantyType
    {
        return WarrantyType::create($data);
    }

    /**
     * Find warranty type by ID (including soft deleted).
     *
     * @param int $id
     * @param bool $withTrashed
     * @return WarrantyType|null
     */
    public function findById(int $id, bool $withTrashed = false): ?WarrantyType
    {
        $query = WarrantyType::query();

        if ($withTrashed) {
            $query->withTrashed();
        }

        return $query->find($id);
    }

    /**
     * Get all warranty types with optional filters.
     *
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAll(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = WarrantyType::query();

        // Search filter
        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        // Active/inactive filter
        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        // Include trashed
        if (!empty($filters['with_trashed'])) {
            $query->withTrashed();
        }

        // Sort
        $sortBy = $filters['sort_by'] ?? 'name';
        $sortOrder = $filters['sort_order'] ?? 'asc';
        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($perPage);
    }

    /**
     * Update warranty type.
     *
     * @param int $id
     * @param array $data
     * @return WarrantyType|null
     */
    public function update(int $id, array $data): ?WarrantyType
    {
        $warrantyType = $this->findById($id);

        if (!$warrantyType) {
            return null;
        }

        $warrantyType->update($data);
        return $warrantyType->fresh();
    }

    /**
     * Delete warranty type (soft delete).
     *
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool
    {
        $warrantyType = $this->findById($id);

        if (!$warrantyType) {
            return false;
        }

        return $warrantyType->delete();
    }

    /**
     * Restore soft-deleted warranty type.
     *
     * @param int $id
     * @return bool
     */
    public function restore(int $id): bool
    {
        $warrantyType = $this->findById($id, true);

        if (!$warrantyType || !$warrantyType->trashed()) {
            return false;
        }

        return $warrantyType->restore();
    }

    /**
     * Get active warranty types only.
     *
     * @return Collection
     */
    public function getActive(): Collection
    {
        return WarrantyType::active()->orderBy('name')->get();
    }
}
