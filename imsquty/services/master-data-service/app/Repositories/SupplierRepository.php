<?php

namespace App\Repositories;

use App\Models\Supplier;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class SupplierRepository
{
    /**
     * Create a new supplier.
     *
     * @param array $data
     * @return Supplier
     */
    public function create(array $data): Supplier
    {
        return Supplier::create($data);
    }

    /**
     * Find supplier by ID (including soft deleted).
     *
     * @param int $id
     * @param bool $withTrashed
     * @return Supplier|null
     */
    public function findById(int $id, bool $withTrashed = false): ?Supplier
    {
        $query = Supplier::query();

        if ($withTrashed) {
            $query->withTrashed();
        }

        return $query->find($id);
    }

    /**
     * Get all suppliers with optional filters.
     *
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAll(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Supplier::query();

        // Search filter
        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        // Active/inactive filter
        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        // City filter
        if (!empty($filters['city'])) {
            $query->where('city', 'like', "%{$filters['city']}%");
        }

        // Country filter
        if (!empty($filters['country'])) {
            $query->where('country', 'like', "%{$filters['country']}%");
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
     * Update supplier.
     *
     * @param int $id
     * @param array $data
     * @return Supplier|null
     */
    public function update(int $id, array $data): ?Supplier
    {
        $supplier = $this->findById($id);

        if (!$supplier) {
            return null;
        }

        $supplier->update($data);
        return $supplier->fresh();
    }

    /**
     * Delete supplier (soft delete).
     *
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool
    {
        $supplier = $this->findById($id);

        if (!$supplier) {
            return false;
        }

        return $supplier->delete();
    }

    /**
     * Restore soft-deleted supplier.
     *
     * @param int $id
     * @return bool
     */
    public function restore(int $id): bool
    {
        $supplier = $this->findById($id, true);

        if (!$supplier || !$supplier->trashed()) {
            return false;
        }

        return $supplier->restore();
    }

    /**
     * Get active suppliers only.
     *
     * @return Collection
     */
    public function getActive(): Collection
    {
        return Supplier::active()->orderBy('name')->get();
    }

    /**
     * Find supplier by code.
     *
     * @param string $code
     * @return Supplier|null
     */
    public function findByCode(string $code): ?Supplier
    {
        return Supplier::where('code', $code)->first();
    }
}
