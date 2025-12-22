<?php

namespace App\Services;

use App\Models\Supplier;
use App\Repositories\SupplierRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Supplier Service
 * 
 * Business logic for supplier/vendor management
 */
class SupplierService
{
    public function __construct(
        private SupplierRepository $repository
    ) {}

    /**
     * Get all suppliers with filters and pagination
     * 
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAllSuppliers(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->getAll($filters, $perPage);
    }

    /**
     * Get supplier by ID
     * 
     * @param int $id
     * @param bool $withTrashed
     * @return Supplier|null
     */
    public function getSupplierById(int $id, bool $withTrashed = false): ?Supplier
    {
        $supplier = $this->repository->findById($id, $withTrashed);
        
        if (!$supplier) {
            throw new \Exception('Supplier not found', 404);
        }
        
        return $supplier;
    }

    /**
     * Create new supplier
     * 
     * @param array $data
     * @return Supplier
     */
    public function createSupplier(array $data): Supplier
    {
        DB::beginTransaction();
        
        try {
            // Check for duplicate code
            if (isset($data['code'])) {
                $existing = $this->repository->findByCode($data['code']);
                if ($existing) {
                    throw new \Exception('Supplier code already exists', 422);
                }
            }
            
            // Set default values
            $data['is_active'] = $data['is_active'] ?? true;
            $data['country'] = $data['country'] ?? 'Indonesia';
            
            // Create supplier
            $supplier = $this->repository->create($data);
            
            DB::commit();
            
            return $supplier;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update supplier
     * 
     * @param int $id
     * @param array $data
     * @return Supplier
     */
    public function updateSupplier(int $id, array $data): Supplier
    {
        DB::beginTransaction();
        
        try {
            // Check if exists
            $supplier = $this->getSupplierById($id);
            
            // Check for duplicate code (if changed)
            if (isset($data['code']) && $data['code'] !== $supplier->code) {
                $existing = $this->repository->findByCode($data['code']);
                if ($existing && $existing->id !== $id) {
                    throw new \Exception('Supplier code already exists', 422);
                }
            }
            
            // Update supplier
            $updated = $this->repository->update($id, $data);
            
            if (!$updated) {
                throw new \Exception('Failed to update supplier', 500);
            }
            
            DB::commit();
            
            return $updated;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Delete supplier (soft delete)
     * 
     * @param int $id
     * @return bool
     */
    public function deleteSupplier(int $id): bool
    {
        DB::beginTransaction();
        
        try {
            // Check if exists
            $this->getSupplierById($id);
            
            // Delete supplier
            $deleted = $this->repository->delete($id);
            
            if (!$deleted) {
                throw new \Exception('Failed to delete supplier', 500);
            }
            
            DB::commit();
            
            return true;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Restore soft-deleted supplier
     * 
     * @param int $id
     * @return bool
     */
    public function restoreSupplier(int $id): bool
    {
        DB::beginTransaction();
        
        try {
            $restored = $this->repository->restore($id);
            
            if (!$restored) {
                throw new \Exception('Failed to restore supplier or supplier not found', 404);
            }
            
            DB::commit();
            
            return true;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get active suppliers only
     * 
     * @return Collection
     */
    public function getActiveSuppliers(): Collection
    {
        return $this->repository->getActive();
    }
}
