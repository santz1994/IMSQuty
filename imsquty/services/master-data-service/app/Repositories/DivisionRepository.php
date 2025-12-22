<?php

namespace App\Repositories;

use App\Models\Division;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class DivisionRepository
{
    /**
     * Create a new division.
     *
     * @param array $data
     * @return Division
     */
    public function create(array $data): Division
    {
        return Division::create($data);
    }

    /**
     * Find division by ID (including soft deleted).
     *
     * @param int $id
     * @param bool $withTrashed
     * @return Division|null
     */
    public function findById(int $id, bool $withTrashed = false): ?Division
    {
        $query = Division::query();

        if ($withTrashed) {
            $query->withTrashed();
        }

        return $query->find($id);
    }

    /**
     * Get all divisions with optional filters.
     *
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAll(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Division::query();

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

        // Manager filter
        if (!empty($filters['manager_id'])) {
            $query->where('manager_id', $filters['manager_id']);
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
     * Update division.
     *
     * @param int $id
     * @param array $data
     * @return Division|null
     */
    public function update(int $id, array $data): ?Division
    {
        $division = $this->findById($id);

        if (!$division) {
            return null;
        }

        $division->update($data);
        return $division->fresh();
    }

    /**
     * Delete division (soft delete).
     *
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool
    {
        $division = $this->findById($id);

        if (!$division) {
            return false;
        }

        return $division->delete();
    }

    /**
     * Restore soft-deleted division.
     *
     * @param int $id
     * @return bool
     */
    public function restore(int $id): bool
    {
        $division = $this->findById($id, true);

        if (!$division || !$division->trashed()) {
            return false;
        }

        return $division->restore();
    }

    /**
     * Get active divisions only.
     *
     * @return Collection
     */
    public function getActive(): Collection
    {
        return Division::active()->orderBy('name')->get();
    }

    /**
     * Find division by code.
     *
     * @param string $code
     * @return Division|null
     */
    public function findByCode(string $code): ?Division
    {
        return Division::where('code', $code)->first();
    }

    /**
     * Get divisions hierarchy (parents with children).
     *
     * @return Collection
     */
    public function getHierarchy(): Collection
    {
        return Division::whereNull('parent_id')
            ->with('children')
            ->active()
            ->orderBy('name')
            ->get();
    }
}
