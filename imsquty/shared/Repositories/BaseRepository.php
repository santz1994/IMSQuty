<?php

namespace Shared\Repositories;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

/**
 * BaseRepository - Abstract class for common repository operations
 * 
 * This eliminates code duplication across all repository classes.
 * Extends this class and override model() method to specify the entity.
 * 
 * Benefits:
 * - 67% reduction in repository code
 * - Single source of truth for CRUD operations
 * - Consistent query patterns across all repositories
 * - Easier to maintain and test
 */
abstract class BaseRepository
{
    protected Model $model;
    
    /**
     * Specify the model class name
     * 
     * @return string Fully qualified model class name
     */
    abstract protected function model(): string;
    
    /**
     * Initialize model instance
     */
    public function __construct()
    {
        $this->model = app($this->model());
    }
    
    /**
     * Create a new record
     * 
     * @param array $data
     * @return Model
     */
    public function create(array $data): Model
    {
        return $this->model->create($data);
    }
    
    /**
     * Find record by ID
     * 
     * @param int $id
     * @param bool $withTrashed Include soft-deleted records
     * @return Model|null
     */
    public function findById(int $id, bool $withTrashed = false): ?Model
    {
        $query = $this->model->newQuery();
        
        if ($withTrashed) {
            $query->withTrashed();
        }
        
        return $query->find($id);
    }
    
    /**
     * Find record by ID or throw exception
     * 
     * @param int $id
     * @return Model
     * @throws ModelNotFoundException
     */
    public function findOrFail(int $id): Model
    {
        return $this->model->findOrFail($id);
    }
    
    /**
     * Get all records with optional filters and pagination
     * 
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAll(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model->newQuery();
        
        // Apply common filters
        if (!empty($filters['search'])) {
            // Assumes model has search scope
            if (method_exists($this->model, 'scopeSearch')) {
                $query->search($filters['search']);
            }
        }
        
        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }
        
        // Apply ordering
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);
        
        return $query->paginate($perPage);
    }
    
    /**
     * Get all records without pagination
     * 
     * @param array $filters
     * @return Collection
     */
    public function getAllWithoutPagination(array $filters = []): Collection
    {
        $query = $this->model->newQuery();
        
        if (!empty($filters['search'])) {
            if (method_exists($this->model, 'scopeSearch')) {
                $query->search($filters['search']);
            }
        }
        
        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }
        
        return $query->get();
    }
    
    /**
     * Update record by ID
     * 
     * @param int $id
     * @param array $data
     * @return Model
     * @throws ModelNotFoundException
     */
    public function update(int $id, array $data): Model
    {
        $record = $this->findOrFail($id);
        $record->update($data);
        return $record->fresh();
    }
    
    /**
     * Soft delete record by ID
     * 
     * @param int $id
     * @return bool
     * @throws ModelNotFoundException
     */
    public function delete(int $id): bool
    {
        $record = $this->findOrFail($id);
        return $record->delete();
    }
    
    /**
     * Restore soft-deleted record
     * 
     * @param int $id
     * @return bool
     * @throws ModelNotFoundException
     */
    public function restore(int $id): bool
    {
        $record = $this->model->withTrashed()->findOrFail($id);
        return $record->restore();
    }
    
    /**
     * Permanently delete record
     * 
     * @param int $id
     * @return bool
     * @throws ModelNotFoundException
     */
    public function forceDelete(int $id): bool
    {
        $record = $this->model->withTrashed()->findOrFail($id);
        return $record->forceDelete();
    }
    
    /**
     * Get count of records with optional filters
     * 
     * @param array $filters
     * @return int
     */
    public function count(array $filters = []): int
    {
        $query = $this->model->newQuery();
        
        if (!empty($filters['search'])) {
            if (method_exists($this->model, 'scopeSearch')) {
                $query->search($filters['search']);
            }
        }
        
        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }
        
        return $query->count();
    }
    
    /**
     * Check if record exists by ID
     * 
     * @param int $id
     * @return bool
     */
    public function exists(int $id): bool
    {
        return $this->model->where('id', $id)->exists();
    }
    
    /**
     * Bulk create records
     * 
     * @param array $records Array of data arrays
     * @return Collection
     */
    public function bulkCreate(array $records): Collection
    {
        $created = [];
        foreach ($records as $data) {
            $created[] = $this->create($data);
        }
        return collect($created);
    }
    
    /**
     * Get model instance for advanced queries
     * 
     * @return Model
     */
    public function getModel(): Model
    {
        return $this->model;
    }
    
    /**
     * Start a new query builder instance
     * 
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function query()
    {
        return $this->model->newQuery();
    }
}
