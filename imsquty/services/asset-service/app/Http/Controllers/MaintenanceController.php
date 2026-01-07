<?php

namespace App\Http\Controllers;

use App\Services\MaintenanceService;
use App\DTOs\MaintenanceDTO;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Shared\Traits\ApiResponses;

/**
 * Maintenance Controller
 * 
 * Handles asset maintenance operations
 */
class MaintenanceController extends Controller
{
    use ApiResponses;

    protected MaintenanceService $maintenanceService;

    public function __construct(MaintenanceService $maintenanceService)
    {
        $this->maintenanceService = $maintenanceService;
    }

    /**
     * Get maintenance history for an asset
     * 
     * @param int $assetId
     * @return JsonResponse
     */
    public function getByAsset(int $assetId): JsonResponse
    {
        try {
            $maintenanceRecords = $this->maintenanceService->getByAssetId($assetId);
            return $this->successResponse($maintenanceRecords, 'Maintenance history retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve maintenance history: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create new maintenance record
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'asset_id' => 'required|integer|exists:assets,id',
                'maintenance_type' => 'required|string|in:Preventive,Corrective,Repair,Inspection',
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'cost' => 'nullable|numeric|min:0',
                'scheduled_at' => 'nullable|date',
                'performed_by' => 'nullable|integer',
                'status' => 'nullable|string|in:Scheduled,In-Progress,Completed,Failed',
                'notes' => 'nullable|string',
            ]);

            $dto = MaintenanceDTO::fromRequest($validated);
            $maintenance = $this->maintenanceService->create($dto);

            return $this->createdResponse($maintenance, 'Maintenance record created successfully');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->errorResponse('Validation failed: ' . json_encode($e->errors()), 422);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to create maintenance record: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update maintenance record
     * 
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'maintenance_type' => 'sometimes|string|in:Preventive,Corrective,Repair,Inspection',
                'title' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'cost' => 'nullable|numeric|min:0',
                'scheduled_at' => 'nullable|date',
                'performed_by' => 'nullable|integer',
                'status' => 'nullable|string|in:Scheduled,In-Progress,Completed,Failed',
                'notes' => 'nullable|string',
            ]);

            $maintenance = $this->maintenanceService->update($id, $validated);

            if (!$maintenance) {
                return $this->notFoundResponse('Maintenance record not found');
            }

            return $this->successResponse($maintenance, 'Maintenance record updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to update maintenance record: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get maintenance by ID
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $maintenance = $this->maintenanceService->getById($id);
            
            if (!$maintenance) {
                return $this->notFoundResponse('Maintenance record not found');
            }

            return $this->successResponse($maintenance, 'Maintenance record retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve maintenance record: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get upcoming maintenance
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function getUpcoming(Request $request): JsonResponse
    {
        try {
            $limit = $request->input('limit', 10);
            $upcoming = $this->maintenanceService->getUpcoming($limit);
            return $this->successResponse($upcoming, 'Upcoming maintenance retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve upcoming maintenance: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get overdue maintenance
     * 
     * @return JsonResponse
     */
    public function getOverdue(): JsonResponse
    {
        try {
            $overdue = $this->maintenanceService->getOverdue();
            return $this->successResponse($overdue, 'Overdue maintenance retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve overdue maintenance: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get maintenance by status
     * 
     * @param string $status
     * @return JsonResponse
     */
    public function getByStatus(string $status): JsonResponse
    {
        try {
            $maintenanceRecords = $this->maintenanceService->getByStatus($status);
            return $this->successResponse($maintenanceRecords, "Maintenance records with status '{$status}' retrieved successfully");
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve maintenance records: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get maintenance by type
     * 
     * @param string $type
     * @return JsonResponse
     */
    public function getByType(string $type): JsonResponse
    {
        try {
            $maintenanceRecords = $this->maintenanceService->getByType($type);
            return $this->successResponse($maintenanceRecords, "Maintenance records with type '{$type}' retrieved successfully");
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve maintenance records: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Complete maintenance record
     * 
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function complete(Request $request, int $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'completed_at' => 'nullable|date',
                'cost' => 'nullable|numeric|min:0',
                'notes' => 'nullable|string',
                'performed_by' => 'nullable|integer',
            ]);

            $maintenance = $this->maintenanceService->complete($id, $validated);

            if (!$maintenance) {
                return $this->notFoundResponse('Maintenance record not found');
            }

            return $this->successResponse($maintenance, 'Maintenance record marked as completed');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to complete maintenance record: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Cancel maintenance record
     * 
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function cancel(Request $request, int $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'reason' => 'required|string',
            ]);

            $maintenance = $this->maintenanceService->cancel($id, $validated['reason']);

            if (!$maintenance) {
                return $this->notFoundResponse('Maintenance record not found');
            }

            return $this->successResponse($maintenance, 'Maintenance record cancelled');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to cancel maintenance record: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get maintenance statistics
     * 
     * @return JsonResponse
     */
    public function getStatistics(): JsonResponse
    {
        try {
            $statistics = $this->maintenanceService->getStatistics();
            return $this->successResponse($statistics, 'Maintenance statistics retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve maintenance statistics: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete maintenance record
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $result = $this->maintenanceService->delete($id);

            if (!$result) {
                return $this->notFoundResponse('Maintenance record not found');
            }

            return $this->successResponse(null, 'Maintenance record deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to delete maintenance record: ' . $e->getMessage(), 500);
        }
    }
}
