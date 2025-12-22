<?php

namespace App\Repositories;

use App\Models\Manufacturer;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class ManufacturerRepository
{
    /**
     * Create a new manufacturer.
     *
     * @param array $data
     * @return Manufacturer
     */
    public function create(array $data): Manufacturer
    {
        return Manufacturer::create($data);
    }

    /**
     * Find manufacturer by ID (including soft deleted).
     *
     * @param int $id
     * @param bool $withTrashed
     * @return Manufacturer|null
     */
    public function findById(int $id, bool $withTrashed = false): ?Manufacturer
    {
        $query = Manufacturer::query();

        if ($withTrashed) {
            $query->withTrashed();
        }

        return $query->find($id);
    }

    /**
     * Get all manufacturers with optional filters.
     *
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAll(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Manufacturer::query();

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
     * Update manufacturer.
     *
     * @param int $id
     * @param array $data
     * @return Manufacturer|null
     */
    public function update(int $id, array $data): ?Manufacturer
    {
        $manufacturer = $this->findById($id);

        if (!$manufacturer) {
            return null;
        }

        $manufacturer->update($data);
        return $manufacturer->fresh();
    }

    /**
     * Delete manufacturer (soft delete).
     *
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool
    {
        $manufacturer = $this->findById($id);

        if (!$manufacturer) {
            return false;
        }

        return $manufacturer->delete();
    }

    /**
     * Restore soft-deleted manufacturer.
     *
     * @param int $id
     * @return bool
     */
    public function restore(int $id): bool
    {
        $manufacturer = $this->findById($id, true);

        if (!$manufacturer || !$manufacturer->trashed()) {
            return false;
        }

        return $manufacturer->restore();
    }

    /**
     * Get active manufacturers only.
     *
     * @return Collection
     */
    public function getActive(): Collection
    {
        return Manufacturer::active()->orderBy('name')->get();
    }

    /**
     * Find manufacturer by code.
     *
     * @param string $code
     * @return Manufacturer|null
     */
    public function findByCode(string $code): ?Manufacturer
    {
        return Manufacturer::where('code', $code)->first();
    }
}
