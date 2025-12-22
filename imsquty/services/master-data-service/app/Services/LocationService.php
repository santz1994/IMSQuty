<?php

namespace App\Services;

use App\Models\Location;
use App\Repositories\LocationRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Location Service
 * 
 * Business logic for location management
 */
class LocationService
{
    public function __construct(
        private LocationRepository $repository
    ) {}

    /**
     * Get all locations with filters and pagination
     * 
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAllLocations(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->getAll($filters, $perPage);
    }

    /**
     * Get location by ID
     * 
     * @param int $id
     * @param bool $withTrashed
     * @return Location|null
     */
    public function getLocationById(int $id, bool $withTrashed = false): ?Location
    {
        $location = $this->repository->findById($id, $withTrashed);
        
        if (!$location) {
            throw new \Exception('Location not found', 404);
        }
        
        return $location;
    }

    /**
     * Create new location
     * 
     * @param array $data
     * @return Location
     */
    public function createLocation(array $data): Location
    {
        DB::beginTransaction();
        
        try {
            // Check for duplicate code
            if (isset($data['code'])) {
                $existing = $this->repository->findByCode($data['code']);
                if ($existing) {
                    throw new \Exception('Location code already exists', 422);
                }
            }
            
            // Set default values
            $data['is_active'] = $data['is_active'] ?? true;
            $data['country'] = $data['country'] ?? 'Indonesia';
            
            // Create location
            $location = $this->repository->create($data);
            
            DB::commit();
            
            return $location;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update location
     * 
     * @param int $id
     * @param array $data
     * @return Location
     */
    public function updateLocation(int $id, array $data): Location
    {
        DB::beginTransaction();
        
        try {
            // Check if exists
            $location = $this->getLocationById($id);
            
            // Check for duplicate code (if changed)
            if (isset($data['code']) && $data['code'] !== $location->code) {
                $existing = $this->repository->findByCode($data['code']);
                if ($existing && $existing->id !== $id) {
                    throw new \Exception('Location code already exists', 422);
                }
            }
            
            // Update location
            $updated = $this->repository->update($id, $data);
            
            if (!$updated) {
                throw new \Exception('Failed to update location', 500);
            }
            
            DB::commit();
            
            return $updated;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Delete location (soft delete)
     * 
     * @param int $id
     * @return bool
     */
    public function deleteLocation(int $id): bool
    {
        DB::beginTransaction();
        
        try {
            // Check if exists
            $location = $this->getLocationById($id);
            
            // Check if has children
            if ($location->children()->count() > 0) {
                throw new \Exception('Cannot delete location with child locations', 422);
            }
            
            // Delete location
            $deleted = $this->repository->delete($id);
            
            if (!$deleted) {
                throw new \Exception('Failed to delete location', 500);
            }
            
            DB::commit();
            
            return true;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Restore soft-deleted location
     * 
     * @param int $id
     * @return bool
     */
    public function restoreLocation(int $id): bool
    {
        DB::beginTransaction();
        
        try {
            $restored = $this->repository->restore($id);
            
            if (!$restored) {
                throw new \Exception('Failed to restore location or location not found', 404);
            }
            
            DB::commit();
            
            return true;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get active locations only
     * 
     * @return Collection
     */
    public function getActiveLocations(): Collection
    {
        return $this->repository->getActive();
    }

    /**
     * Get locations hierarchy
     * 
     * @return Collection
     */
    public function getLocationsHierarchy(): Collection
    {
        return $this->repository->getHierarchy();
    }
}
