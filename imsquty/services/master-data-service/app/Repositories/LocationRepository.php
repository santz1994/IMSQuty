<?php

namespace App\Repositories;

use App\Models\Location;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class LocationRepository
{
    /**
     * Create a new location.
     *
     * @param array $data
     * @return Location
     */
    public function create(array $data): Location
    {
        return Location::create($data);
    }

    /**
     * Find location by ID (including soft deleted).
     *
     * @param int $id
     * @param bool $withTrashed
     * @return Location|null
     */
    public function findById(int $id, bool $withTrashed = false): ?Location
    {
        $query = Location::query();

        if ($withTrashed) {
            $query->withTrashed();
        }

        return $query->find($id);
    }

    /**
     * Get all locations with optional filters.
     *
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAll(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Location::query();

        // Search filter
        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        // Active/inactive filter
        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        // Parent filter
        if (isset($filters['parent_id'])) {
            $query->where('parent_id', $filters['parent_id']);
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
     * Update location.
     *
     * @param int $id
     * @param array $data
     * @return Location|null
     */
    public function update(int $id, array $data): ?Location
    {
        $location = $this->findById($id);

        if (!$location) {
            return null;
        }

        $location->update($data);
        return $location->fresh();
    }

    /**
     * Delete location (soft delete).
     *
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool
    {
        $location = $this->findById($id);

        if (!$location) {
            return false;
        }

        return $location->delete();
    }

    /**
     * Restore soft-deleted location.
     *
     * @param int $id
     * @return bool
     */
    public function restore(int $id): bool
    {
        $location = $this->findById($id, true);

        if (!$location || !$location->trashed()) {
            return false;
        }

        return $location->restore();
    }

    /**
     * Get active locations only.
     *
     * @return Collection
     */
    public function getActive(): Collection
    {
        return Location::active()->orderBy('name')->get();
    }

    /**
     * Find location by code.
     *
     * @param string $code
     * @return Location|null
     */
    public function findByCode(string $code): ?Location
    {
        return Location::where('code', $code)->first();
    }

    /**
     * Get locations hierarchy (parents with children).
     *
     * @return Collection
     */
    public function getHierarchy(): Collection
    {
        return Location::whereNull('parent_id')
            ->with('children')
            ->active()
            ->orderBy('name')
            ->get();
    }
}
