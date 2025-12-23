<?php

namespace App\Services;

use App\Models\Division;
use App\Repositories\DivisionRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Division Service
 * 
 * Business logic for division/department management
 */
class DivisionService
{
    public function __construct(
        private DivisionRepository $repository
    ) {}

    /**
     * Get all divisions with filters and pagination
     * 
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAllDivisions(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->getAll($filters, $perPage);
    }

    /**
     * Get division by ID
     * 
     * @param int $id
     * @param bool $withTrashed
     * @return Division|null
     */
    public function getDivisionById(int $id, bool $withTrashed = false): ?Division
    {
        $division = $this->repository->findById($id, $withTrashed);
        
        if (!$division) {
            $exception = new ModelNotFoundException("Division {$id} not found");
            $exception->setModel(Division::class);
            throw $exception;
        }
        
        return $division;
    }

    /**
     * Create new division
     * 
     * @param array $data
     * @return Division
     */
    public function createDivision(array $data): Division
    {
        DB::beginTransaction();
        
        try {
            // Check for duplicate code
            if (isset($data['code'])) {
                $existing = $this->repository->findByCode($data['code']);
                if ($existing) {
                    throw new \Exception('Division code already exists', 422);
                }
            }
            
            // Set default values
            $data['is_active'] = $data['is_active'] ?? true;
            
            // Create division
            $division = $this->repository->create($data);
            
            DB::commit();
            
            return $division;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update division
     * 
     * @param int $id
     * @param array $data
     * @return Division
     */
    public function updateDivision(int $id, array $data): Division
    {
        DB::beginTransaction();
        
        try {
            // Check if exists
            $division = $this->getDivisionById($id);
            
            // Check for duplicate code (if changed)
            if (isset($data['code']) && $data['code'] !== $division->code) {
                $existing = $this->repository->findByCode($data['code']);
                if ($existing && $existing->id !== $id) {
                    throw new \Exception('Division code already exists', 422);
                }
            }
            
            // Update division
            $updated = $this->repository->update($id, $data);
            
            if (!$updated) {
                throw new \Exception('Failed to update division', 500);
            }
            
            DB::commit();
            
            return $updated;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Delete division (soft delete)
     * 
     * @param int $id
     * @return bool
     */
    public function deleteDivision(int $id): bool
    {
        DB::beginTransaction();
        
        try {
            // Check if exists
            $division = $this->getDivisionById($id);
            
            // Check if has children
            if ($division->children()->count() > 0) {
                throw new \Exception('Cannot delete division with child divisions', 422);
            }
            
            // Delete division
            $deleted = $this->repository->delete($id);
            
            if (!$deleted) {
                throw new \Exception('Failed to delete division', 500);
            }
            
            DB::commit();
            
            return true;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Restore soft-deleted division
     * 
     * @param int $id
     * @return Division
     */
    public function restoreDivision(int $id): Division
    {
        DB::beginTransaction();
        
        try {
            $restored = $this->repository->restore($id);
            
            if (!$restored) {
                throw new \Exception('Failed to restore division or division not found', 404);
            }
            
            $division = $this->repository->findById($id, true);
            
            DB::commit();
            
            return $division;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get active divisions only
     * 
     * @return Collection
     */
    public function getActiveDivisions(): Collection
    {
        return $this->repository->getActive();
    }

    /**
     * Get divisions hierarchy
     * 
     * @return array
     */
    public function getDivisionsHierarchy(): array
    {
        return $this->repository->getHierarchy()->toArray();
    }
}
