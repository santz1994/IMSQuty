<?php

namespace App\Services;

use App\Models\WarrantyType;
use App\Repositories\WarrantyTypeRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * WarrantyType Service
 * 
 * Business logic for warranty type management
 */
class WarrantyTypeService
{
    public function __construct(
        private WarrantyTypeRepository $repository
    ) {}

    /**
     * Get all warranty types with filters and pagination
     * 
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAllWarrantyTypes(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->getAll($filters, $perPage);
    }

    /**
     * Get warranty type by ID
     * 
     * @param int $id
     * @param bool $withTrashed
     * @return WarrantyType|null
     */
    public function getWarrantyTypeById(int $id, bool $withTrashed = false): ?WarrantyType
    {
        $warrantyType = $this->repository->findById($id, $withTrashed);
        
        if (!$warrantyType) {
            throw new \Exception('Warranty type not found', 404);
        }
        
        return $warrantyType;
    }

    /**
     * Create new warranty type
     * 
     * @param array $data
     * @return WarrantyType
     */
    public function createWarrantyType(array $data): WarrantyType
    {
        DB::beginTransaction();
        
        try {
            // Set default values
            $data['is_active'] = $data['is_active'] ?? true;
            $data['default_duration_months'] = $data['default_duration_months'] ?? 12;
            
            // Create warranty type
            $warrantyType = $this->repository->create($data);
            
            DB::commit();
            
            return $warrantyType;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update warranty type
     * 
     * @param int $id
     * @param array $data
     * @return WarrantyType
     */
    public function updateWarrantyType(int $id, array $data): WarrantyType
    {
        DB::beginTransaction();
        
        try {
            // Check if exists
            $this->getWarrantyTypeById($id);
            
            // Update warranty type
            $updated = $this->repository->update($id, $data);
            
            if (!$updated) {
                throw new \Exception('Failed to update warranty type', 500);
            }
            
            DB::commit();
            
            return $updated;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Delete warranty type (soft delete)
     * 
     * @param int $id
     * @return bool
     */
    public function deleteWarrantyType(int $id): bool
    {
        DB::beginTransaction();
        
        try {
            // Check if exists
            $this->getWarrantyTypeById($id);
            
            // Delete warranty type
            $deleted = $this->repository->delete($id);
            
            if (!$deleted) {
                throw new \Exception('Failed to delete warranty type', 500);
            }
            
            DB::commit();
            
            return true;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Restore soft-deleted warranty type
     * 
     * @param int $id
     * @return bool
     */
    public function restoreWarrantyType(int $id): bool
    {
        DB::beginTransaction();
        
        try {
            $restored = $this->repository->restore($id);
            
            if (!$restored) {
                throw new \Exception('Failed to restore warranty type or warranty type not found', 404);
            }
            
            DB::commit();
            
            return true;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get active warranty types only
     * 
     * @return Collection
     */
    public function getActiveWarrantyTypes(): Collection
    {
        return $this->repository->getActive();
    }
}
