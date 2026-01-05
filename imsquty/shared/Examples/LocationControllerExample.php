<?php

namespace App\Http\Controllers;

use App\Services\LocationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Shared\Traits\ApiResponses;

/**
 * LocationController - Example implementation using ApiResponses trait
 * 
 * This demonstrates how to use the ApiResponses trait to eliminate
 * repetitive try-catch blocks and response formatting.
 */
class LocationControllerExample extends Controller
{
    use ApiResponses;
    
    protected LocationService $service;
    
    public function __construct(LocationService $service)
    {
        $this->service = $service;
    }
    
    /**
     * Get all locations
     * 
     * Before: 20+ lines with try-catch and response formatting
     * After: 3 lines using trait methods
     */
    public function index(Request $request): JsonResponse
    {
        $locations = $this->service->getAllLocations($request->all());
        return $this->paginatedResponse($locations, 'Locations retrieved successfully');
    }
    
    /**
     * Get single location
     */
    public function show(int $locationId): JsonResponse
    {
        $location = $this->service->getLocationById($locationId);
        
        if (!$location) {
            return $this->notFoundResponse('Location not found');
        }
        
        return $this->successResponse($location, 'Location retrieved successfully');
    }
    
    /**
     * Create location
     */
    public function store(Request $request): JsonResponse
    {
        $location = $this->service->createLocation($request->validated());
        return $this->createdResponse($location, 'Location created successfully');
    }
    
    /**
     * Update location
     */
    public function update(Request $request, int $locationId): JsonResponse
    {
        $location = $this->service->updateLocation($locationId, $request->validated());
        
        if (!$location) {
            return $this->notFoundResponse('Location not found');
        }
        
        return $this->successResponse($location, 'Location updated successfully');
    }
    
    /**
     * Delete location
     */
    public function destroy(int $locationId): JsonResponse
    {
        $result = $this->service->deleteLocation($locationId);
        
        if (!$result) {
            return $this->notFoundResponse('Location not found');
        }
        
        return $this->deletedResponse('Location deleted successfully');
    }
    
    // No try-catch blocks needed! Let global exception handler manage errors
    // No repetitive response formatting - all handled by trait methods
}
