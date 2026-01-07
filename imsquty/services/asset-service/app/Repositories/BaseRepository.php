<?php

namespace App\Repositories;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

abstract class BaseRepository
{
    protected $model;

    /**
     * Constructor
     */
    abstract public function __construct();

    /**
     * Get all records
     */
    public function all(): Collection
    {
        return $this->model->all();
    }

    /**
     * Get paginated records
     */
    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = $this->applyFilters($this->model, $filters);
        return $query->paginate($perPage);
    }

    /**
     * Find a record by ID
     */
    public function findById(string $id): ?Model
    {
        return $this->model->find($id);
    }

    /**
     * Find a record by criteria
     */
    public function findBy(array $criteria): ?Model
    {
        $query = $this->model;
        foreach ($criteria as $key => $value) {
            $query = $query->where($key, $value);
        }
        return $query->first();
    }

    /**
     * Get records by criteria
     */
    public function getBy(array $criteria, int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model;
        foreach ($criteria as $key => $value) {
            $query = $query->where($key, $value);
        }
        return $query->paginate($perPage);
    }

    /**
     * Create a record
     */
    public function create(array $data): Model
    {
        return $this->model->create($data);
    }

    /**
     * Update a record
     */
    public function update(Model $model, array $data): bool
    {
        return $model->update($data);
    }

    /**
     * Delete a record
     */
    public function delete(Model $model): bool
    {
        return $model->delete();
    }

    /**
     * Restore a soft-deleted record
     */
    public function restore(Model $model): bool
    {
        return $model->restore();
    }

    /**
     * Count records
     */
    public function count(array $filters = []): int
    {
        $query = $this->applyFilters($this->model, $filters);
        return $query->count();
    }

    /**
     * Check if record exists
     */
    public function exists(array $criteria): bool
    {
        $query = $this->model;
        foreach ($criteria as $key => $value) {
            $query = $query->where($key, $value);
        }
        return $query->exists();
    }

    /**
     * Apply filters to query
     * Override in child classes for custom filtering
     */
    protected function applyFilters(Builder $query, array $filters): Builder
    {
        // Handle search
        if (isset($filters['search']) && $filters['search']) {
            $query = $query->where(function ($q) use ($filters) {
                foreach ($this->getSearchableFields() as $field) {
                    $q->orWhere($field, 'like', "%{$filters['search']}%");
                }
            });
        }

        // Handle sorting
        if (isset($filters['sort_by']) && isset($filters['sort_order'])) {
            $query = $query->orderBy($filters['sort_by'], $filters['sort_order']);
        }

        // Handle date range
        if (isset($filters['date_from']) && $filters['date_from']) {
            $query = $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to']) && $filters['date_to']) {
            $query = $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return $query;
    }

    /**
     * Get searchable fields
     * Override in child classes
     */
    protected function getSearchableFields(): array
    {
        return ['id'];
    }
}
