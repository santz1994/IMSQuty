<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

abstract class BaseService
{
    protected $repository;

    /**
     * Constructor
     */
    abstract public function __construct();

    /**
     * Get all records with pagination
     */
    public function all(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        return $this->repository->paginate($perPage, $filters);
    }

    /**
     * Find a record by ID
     */
    public function find(string $id): ?Model
    {
        return $this->repository->findById($id);
    }

    /**
     * Create a new record
     */
    public function create(array $data): Model
    {
        return $this->repository->create($data);
    }

    /**
     * Update a record
     */
    public function update(string $id, array $data): bool
    {
        $model = $this->find($id);
        if (!$model) {
            return false;
        }
        return $model->update($data);
    }

    /**
     * Delete a record
     */
    public function delete(string $id): bool
    {
        $model = $this->find($id);
        if (!$model) {
            return false;
        }
        return $model->delete();
    }

    /**
     * Find by specific criteria
     */
    public function findBy(array $criteria): ?Model
    {
        return $this->repository->findBy($criteria);
    }

    /**
     * Get records matching criteria
     */
    public function getBy(array $criteria, int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->getBy($criteria, $perPage);
    }

    /**
     * Count records
     */
    public function count(array $filters = []): int
    {
        return $this->repository->count($filters);
    }
}
