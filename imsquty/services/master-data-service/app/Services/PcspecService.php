<?php

namespace App\Services;

use App\Models\Pcspec;
use App\Repositories\PcspecRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Pcspec Service
 * 
 * Business logic for PC specification management
 */
class PcspecService
{
    public function __construct(
        private PcspecRepository $repository
    ) {}

    /**
     * Get all PC specifications with filters and pagination
     * 
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAllPcspecs(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->getAll($filters, $perPage);
    }

    /**
     * Get PC specification by ID
     * 
     * @param int $id
     * @param bool $withTrashed
     * @return Pcspec|null
     */
    public function getPcspecById(int $id, bool $withTrashed = false): ?Pcspec
    {
        $pcspec = $this->repository->findById($id, $withTrashed);
        
        if (!$pcspec) {
            throw new \Exception('PC specification not found', 404);
        }
        
        return $pcspec;
    }

    /**
     * Create new PC specification
     * 
     * @param array $data
     * @return Pcspec
     */
    public function createPcspec(array $data): Pcspec
    {
        DB::beginTransaction();
        
        try {
            // Set default values
            $data['is_active'] = $data['is_active'] ?? true;
            
            // Create PC specification
            $pcspec = $this->repository->create($data);
            
            DB::commit();
            
            return $pcspec;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update PC specification
     * 
     * @param int $id
     * @param array $data
     * @return Pcspec
     */
    public function updatePcspec(int $id, array $data): Pcspec
    {
        DB::beginTransaction();
        
        try {
            // Check if exists
            $this->getPcspecById($id);
            
            // Update PC specification
            $updated = $this->repository->update($id, $data);
            
            if (!$updated) {
                throw new \Exception('Failed to update PC specification', 500);
            }
            
            DB::commit();
            
            return $updated;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Delete PC specification (soft delete)
     * 
     * @param int $id
     * @return bool
     */
    public function deletePcspec(int $id): bool
    {
        DB::beginTransaction();
        
        try {
            // Check if exists
            $this->getPcspecById($id);
            
            // Delete PC specification
            $deleted = $this->repository->delete($id);
            
            if (!$deleted) {
                throw new \Exception('Failed to delete PC specification', 500);
            }
            
            DB::commit();
            
            return true;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Restore soft-deleted PC specification
     * 
     * @param int $id
     * @return bool
     */
    public function restorePcspec(int $id): bool
    {
        DB::beginTransaction();
        
        try {
            $restored = $this->repository->restore($id);
            
            if (!$restored) {
                throw new \Exception('Failed to restore PC specification or PC specification not found', 404);
            }
            
            DB::commit();
            
            return true;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get active PC specifications only
     * 
     * @return Collection
     */
    public function getActivePcspecs(): Collection
    {
        return $this->repository->getActive();
    }
}
