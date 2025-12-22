<?php

namespace App\Services;

use App\Models\Manufacturer;
use App\Repositories\ManufacturerRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Manufacturer Service
 * 
 * Business logic for manufacturer management
 */
class ManufacturerService
{
    public function __construct(
        private ManufacturerRepository $repository
    ) {}

    /**
     * Get all manufacturers with filters and pagination
     * 
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAllManufacturers(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->getAll($filters, $perPage);
    }

    /**
     * Get manufacturer by ID
     * 
     * @param int $id
     * @param bool $withTrashed
     * @return Manufacturer|null
     */
    public function getManufacturerById(int $id, bool $withTrashed = false): ?Manufacturer
    {
        $manufacturer = $this->repository->findById($id, $withTrashed);
        
        if (!$manufacturer) {
            throw new \Exception('Manufacturer not found', 404);
        }
        
        return $manufacturer;
    }

    /**
     * Create new manufacturer
     * 
     * @param array $data
     * @return Manufacturer
     */
    public function createManufacturer(array $data): Manufacturer
    {
        DB::beginTransaction();
        
        try {
            // Check for duplicate code (if provided)
            if (isset($data['code'])) {
                $existing = $this->repository->findByCode($data['code']);
                if ($existing) {
                    throw new \Exception('Manufacturer code already exists', 422);
                }
            }
            
            // Set default values
            $data['is_active'] = $data['is_active'] ?? true;
            
            // Create manufacturer
            $manufacturer = $this->repository->create($data);
            
            DB::commit();
            
            return $manufacturer;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update manufacturer
     * 
     * @param int $id
     * @param array $data
     * @return Manufacturer
     */
    public function updateManufacturer(int $id, array $data): Manufacturer
    {
        DB::beginTransaction();
        
        try {
            // Check if exists
            $manufacturer = $this->getManufacturerById($id);
            
            // Check for duplicate code (if changed)
            if (isset($data['code']) && $data['code'] !== $manufacturer->code) {
                $existing = $this->repository->findByCode($data['code']);
                if ($existing && $existing->id !== $id) {
                    throw new \Exception('Manufacturer code already exists', 422);
                }
            }
            
            // Update manufacturer
            $updated = $this->repository->update($id, $data);
            
            if (!$updated) {
                throw new \Exception('Failed to update manufacturer', 500);
            }
            
            DB::commit();
            
            return $updated;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Delete manufacturer (soft delete)
     * 
     * @param int $id
     * @return bool
     */
    public function deleteManufacturer(int $id): bool
    {
        DB::beginTransaction();
        
        try {
            // Check if exists
            $this->getManufacturerById($id);
            
            // Delete manufacturer
            $deleted = $this->repository->delete($id);
            
            if (!$deleted) {
                throw new \Exception('Failed to delete manufacturer', 500);
            }
            
            DB::commit();
            
            return true;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Restore soft-deleted manufacturer
     * 
     * @param int $id
     * @return bool
     */
    public function restoreManufacturer(int $id): bool
    {
        DB::beginTransaction();
        
        try {
            $restored = $this->repository->restore($id);
            
            if (!$restored) {
                throw new \Exception('Failed to restore manufacturer or manufacturer not found', 404);
            }
            
            DB::commit();
            
            return true;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get active manufacturers only
     * 
     * @return Collection
     */
    public function getActiveManufacturers(): Collection
    {
        return $this->repository->getActive();
    }
}
