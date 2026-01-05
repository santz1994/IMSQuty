<?php

namespace App\Repositories;

use App\Models\Location;
use Illuminate\Support\Collection;
use Shared\Repositories\BaseRepository;

/**
 * LocationRepository - Example implementation using BaseRepository
 * 
 * This demonstrates how to extend BaseRepository to eliminate duplicate code.
 * Now only location-specific methods need to be defined here.
 */
class LocationRepositoryExample extends BaseRepository
{
    /**
     * Specify the model class
     * 
     * @return string
     */
    protected function model(): string
    {
        return Location::class;
    }
    
    /**
     * Find locations by division ID
     * 
     * This is a location-specific method that doesn't exist in BaseRepository
     * 
     * @param int $divisionId
     * @return Collection
     */
    public function findByDivision(int $divisionId): Collection
    {
        return $this->model->where('division_id', $divisionId)->get();
    }
    
    /**
     * Get active locations for a specific division
     * 
     * @param int $divisionId
     * @return Collection
     */
    public function getActiveByDivision(int $divisionId): Collection
    {
        return $this->model
            ->where('division_id', $divisionId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();
    }
    
    /**
     * Find location by code
     * 
     * @param string $code
     * @return Location|null
     */
    public function findByCode(string $code): ?Location
    {
        return $this->model->where('code', $code)->first();
    }
    
    // All common methods (create, findById, getAll, update, delete, etc.) 
    // are inherited from BaseRepository - no need to redefine them!
}
