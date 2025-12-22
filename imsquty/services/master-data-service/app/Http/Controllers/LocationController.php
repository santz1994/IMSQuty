<?php

namespace App\Http\Controllers;

use App\Http\Requests\Location\CreateLocationRequest;
use App\Http\Requests\Location\UpdateLocationRequest;
use App\Http\Resources\LocationResource;
use App\Services\LocationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Location Controller
 * 
 * Handles CRUD operations for locations
 * Delegates business logic to LocationService
 */
class LocationController extends Controller
{
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
        try {
            $filters = $request->only(['search', 'is_active', 'parent_id', 'city', 'country', 'with_trashed', 'sort_by', 'sort_order']);
            $perPage = $request->input('per_page', 15);
            
            $locations = $this->service->getAllLocations($filters, $perPage);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'data' => LocationResource::collection($locations->items()),
                    'meta' => [
                        'current_page' => $locations->currentPage(),
                        'total' => $locations->total(),
                        'per_page' => $locations->perPage(),
                        'last_page' => $locations->lastPage(),
                    ]
                ],
                'message' => 'Locations retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to retrieve locations'
            ], 500);
        }
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
            
            return response()->json([
                'success' => true,
                'data' => new LocationResource($location),
                'message' => 'Location retrieved successfully'
            ]);
        } catch (\Exception $e) {
            $status = $e->getCode() === 404 ? 404 : 500;
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to retrieve location'
            ], $status);
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
        try {
            $location = $this->service->createLocation($request->validated());
            
            return response()->json([
                'success' => true,
                'data' => new LocationResource($location),
                'message' => 'Location created successfully'
            ], 201);
        } catch (\Exception $e) {
            $status = $e->getCode() === 422 ? 422 : 500;
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to create location'
            ], $status);
        }
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
            
            return response()->json([
                'success' => true,
                'data' => new LocationResource($location),
                'message' => 'Location updated successfully'
            ]);
        } catch (\Exception $e) {
            $status = match($e->getCode()) {
                404 => 404,
                422 => 422,
                default => 500
            };
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to update location'
            ], $status);
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
            
            return response()->json([
                'success' => true,
                'message' => 'Location deleted successfully'
            ]);
        } catch (\Exception $e) {
            $status = match($e->getCode()) {
                404 => 404,
                422 => 422,
                default => 500
            };
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to delete location'
            ], $status);
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
            
            return response()->json([
                'success' => true,
                'message' => 'Location restored successfully'
            ]);
        } catch (\Exception $e) {
            $status = $e->getCode() === 404 ? 404 : 500;
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to restore location'
            ], $status);
        }
    }

    /**
     * Get active locations only (for dropdown/select)
     * 
     * @return JsonResponse
     */
    public function active(): JsonResponse
    {
        try {
            $locations = $this->service->getActiveLocations();
            
            return response()->json([
                'success' => true,
                'data' => LocationResource::collection($locations),
                'message' => 'Active locations retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to retrieve active locations'
            ], 500);
        }
    }

    /**
     * Get locations hierarchy
     * 
     * @return JsonResponse
     */
    public function hierarchy(): JsonResponse
    {
        try {
            $locations = $this->service->getLocationsHierarchy();
            
            return response()->json([
                'success' => true,
                'data' => LocationResource::collection($locations),
                'message' => 'Locations hierarchy retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to retrieve locations hierarchy'
            ], 500);
        }
    }
}
