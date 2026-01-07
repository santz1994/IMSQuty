<?php

namespace App\Http\Controllers;

use App\Services\MovementService;
use App\DTOs\AssetMovementDTO;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Shared\Traits\ApiResponses;
use Carbon\Carbon;

/**
 * Movement Controller
 * 
 * Handles asset movement/transfer operations
 */
class MovementController extends Controller
{
    use ApiResponses;

    protected MovementService $movementService;

    public function __construct(MovementService $movementService)
    {
        $this->movementService = $movementService;
    }

    /**
     * Get movement history for an asset
     * 
     * @param int $assetId
     * @return JsonResponse
     */
    public function getByAsset(int $assetId): JsonResponse
    {
        try {
            $movements = $this->movementService->getByAssetId($assetId);
            return $this->successResponse($movements, 'Movement history retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve movement history: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create new movement record
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'asset_id' => 'required|integer|exists:assets,id',
                'from_location_id' => 'required|integer',
                'to_location_id' => 'required|integer|different:from_location_id',
                'movement_date' => 'nullable|date',
                'moved_by' => 'nullable|integer',
                'reason' => 'nullable|string',
                'notes' => 'nullable|string',
            ]);

            $dto = AssetMovementDTO::fromRequest($validated);
            $movement = $this->movementService->create($dto);

            return $this->createdResponse($movement, 'Movement record created successfully');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->errorResponse('Validation failed: ' . json_encode($e->errors()), 422);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to create movement record: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get movement by ID
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $movement = $this->movementService->getById($id);
            
            if (!$movement) {
                return $this->notFoundResponse('Movement record not found');
            }

            return $this->successResponse($movement, 'Movement record retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve movement record: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get movements by location
     * 
     * @param Request $request
     * @param int $locationId
     * @return JsonResponse
     */
    public function getByLocation(Request $request, int $locationId): JsonResponse
    {
        try {
            $type = $request->input('type', 'both'); // from, to, both
            $movements = $this->movementService->getByLocation($locationId, $type);
            return $this->successResponse($movements, "Movement records for location retrieved successfully");
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve movement records: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get movements by date range
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function getByDateRange(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
            ]);

            $startDate = Carbon::parse($validated['start_date']);
            $endDate = Carbon::parse($validated['end_date']);

            $movements = $this->movementService->getByDateRange($startDate, $endDate);
            return $this->successResponse($movements, 'Movement records for date range retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve movement records: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get recent movements
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function getRecent(Request $request): JsonResponse
    {
        try {
            $limit = $request->input('limit', 10);
            $movements = $this->movementService->getRecent($limit);
            return $this->successResponse($movements, 'Recent movements retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve recent movements: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get movement statistics
     * 
     * @return JsonResponse
     */
    public function getStatistics(): JsonResponse
    {
        try {
            $statistics = $this->movementService->getStatistics();
            return $this->successResponse($statistics, 'Movement statistics retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve movement statistics: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get current location of an asset
     * 
     * @param int $assetId
     * @return JsonResponse
     */
    public function getCurrentLocation(int $assetId): JsonResponse
    {
        try {
            $locationId = $this->movementService->getCurrentLocation($assetId);
            
            if (!$locationId) {
                return $this->notFoundResponse('No movement history found for this asset');
            }

            return $this->successResponse([
                'asset_id' => $assetId,
                'current_location_id' => $locationId,
            ], 'Current location retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve current location: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete movement record
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $result = $this->movementService->delete($id);

            if (!$result) {
                return $this->notFoundResponse('Movement record not found');
            }

            return $this->successResponse(null, 'Movement record deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to delete movement record: ' . $e->getMessage(), 500);
        }
    }
}
