<?php

namespace App\Http\Controllers;

use App\Http\Requests\Location\CreateLocationRequest;
use App\Http\Requests\Location\UpdateLocationRequest;
use App\Http\Resources\LocationResource;
use App\Services\LocationService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Shared\Traits\ApiResponses;

/**
 * Location Controller
 * 
 * Handles CRUD operations for locations
 * Delegates business logic to LocationService
 */
class LocationController extends Controller
{
    use ApiResponses;

    public function __construct(
        private LocationService $service
    ) {}

    /**
     * Get all locations with filtering and pagination
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'is_active', 'parent_id', 'city', 'country', 'with_trashed', 'sort_by', 'sort_order']);
        $perPage = $request->input('per_page', 15);
        
        $locations = $this->service->getAllLocations($filters, $perPage);
        
        return $this->paginatedResponse(
            LocationResource::collection($locations->items())->resolve(),
            $locations,
            'Locations retrieved successfully'
        );
    }

    /**
     * Get single location by ID
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $location = $this->service->getLocationById($id);
            return $this->successResponse(
                (new LocationResource($location))->resolve(),
                'Location retrieved successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('Location not found');
        }
    }

    /**
     * Create new location
     * 
     * @param CreateLocationRequest $request
     * @return JsonResponse
     */
    public function store(CreateLocationRequest $request): JsonResponse
    {
        $location = $this->service->createLocation($request->validated());
        return $this->createdResponse(
            (new LocationResource($location))->resolve(),
            'Location created successfully'
        );
    }

    /**
     * Update existing location
     * 
     * @param UpdateLocationRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateLocationRequest $request, int $id): JsonResponse
    {
        try {
            $location = $this->service->updateLocation($id, $request->validated());
            return $this->successResponse(
                (new LocationResource($location))->resolve(),
                'Location updated successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('Location not found');
        }
    }

    /**
     * Delete location (soft delete)
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->service->deleteLocation($id);
            return $this->deletedResponse('Location deleted successfully');
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('Location not found');
        }
    }

    /**
     * Restore soft-deleted location
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function restore(int $id): JsonResponse
    {
        try {
            $this->service->restoreLocation($id);
            return $this->successResponse(null, 'Location restored successfully');
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('Location not found');
        }
    }

    /**
     * Get active locations only (for dropdown/select)
     * 
     * @return JsonResponse
     */
    public function active(): JsonResponse
    {
        $locations = $this->service->getActiveLocations();
        return $this->successResponse(
            LocationResource::collection($locations)->resolve(),
            'Active locations retrieved successfully'
        );
    }

    /**
     * Get locations hierarchy
     * 
     * @return JsonResponse
     */
    public function hierarchy(): JsonResponse
    {
        $locations = $this->service->getLocationsHierarchy();
        return $this->successResponse($locations, 'Locations hierarchy retrieved successfully');
    }
}
