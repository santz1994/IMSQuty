<?php

namespace App\Repositories;

use App\Models\Pcspec;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class PcspecRepository
{
    /**
     * Create a new PC specification.
     *
     * @param array $data
     * @return Pcspec
     */
    public function create(array $data): Pcspec
    {
        return Pcspec::create($data);
    }

    /**
     * Find PC specification by ID (including soft deleted).
     *
     * @param int $id
     * @param bool $withTrashed
     * @return Pcspec|null
     */
    public function findById(int $id, bool $withTrashed = false): ?Pcspec
    {
        $query = Pcspec::query();

        if ($withTrashed) {
            $query->withTrashed();
        }

        return $query->find($id);
    }

    /**
     * Get all PC specifications with optional filters.
     *
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAll(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Pcspec::query();

        // Search filter
        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        // Active/inactive filter
        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        // CPU filter
        if (!empty($filters['cpu'])) {
            $query->where('cpu', 'like', "%{$filters['cpu']}%");
        }

        // RAM filter
        if (!empty($filters['ram'])) {
            $query->where('ram', 'like', "%{$filters['ram']}%");
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
     * Update PC specification.
     *
     * @param int $id
     * @param array $data
     * @return Pcspec|null
     */
    public function update(int $id, array $data): ?Pcspec
    {
        $pcspec = $this->findById($id);

        if (!$pcspec) {
            return null;
        }

        $pcspec->update($data);
        return $pcspec->fresh();
    }

    /**
     * Delete PC specification (soft delete).
     *
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool
    {
        $pcspec = $this->findById($id);

        if (!$pcspec) {
            return false;
        }

        return $pcspec->delete();
    }

    /**
     * Restore soft-deleted PC specification.
     *
     * @param int $id
     * @return bool
     */
    public function restore(int $id): bool
    {
        $pcspec = $this->findById($id, true);

        if (!$pcspec || !$pcspec->trashed()) {
            return false;
        }

        return $pcspec->restore();
    }

    /**
     * Get active PC specifications only.
     *
     * @return Collection
     */
    public function getActive(): Collection
    {
        return Pcspec::active()->orderBy('name')->get();
    }
}
