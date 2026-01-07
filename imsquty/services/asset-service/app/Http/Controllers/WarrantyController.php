<?php

namespace App\Http\Controllers;

use App\Services\WarrantyService;
use App\DTOs\WarrantyDTO;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Shared\Traits\ApiResponses;

/**
 * Warranty Controller
 * 
 * Handles asset warranty operations
 */
class WarrantyController extends Controller
{
    use ApiResponses;

    protected WarrantyService $warrantyService;

    public function __construct(WarrantyService $warrantyService)
    {
        $this->warrantyService = $warrantyService;
    }

    /**
     * Get warranty information for an asset
     * 
     * @param int $assetId
     * @return JsonResponse
     */
    public function getByAsset(int $assetId): JsonResponse
    {
        try {
            $warranty = $this->warrantyService->getByAssetId($assetId);
            
            if (!$warranty) {
                return $this->notFoundResponse('Warranty information not found for this asset');
            }

            return $this->successResponse($warranty, 'Warranty information retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve warranty information: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get assets with expiring warranty
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function getExpiring(Request $request): JsonResponse
    {
        try {
            $days = $request->input('days', 30);
            $expiring = $this->warrantyService->getExpiring($days);
            return $this->successResponse($expiring, "Assets with warranty expiring in {$days} days retrieved successfully");
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve expiring warranties: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get expired warranties
     * 
     * @return JsonResponse
     */
    public function getExpired(): JsonResponse
    {
        try {
            $expired = $this->warrantyService->getExpired();
            return $this->successResponse($expired, 'Expired warranties retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve expired warranties: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get active warranties
     * 
     * @return JsonResponse
     */
    public function getActive(): JsonResponse
    {
        try {
            $active = $this->warrantyService->getActive();
            return $this->successResponse($active, 'Active warranties retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve active warranties: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get warranty statistics
     * 
     * @return JsonResponse
     */
    public function getStatistics(): JsonResponse
    {
        try {
            $statistics = $this->warrantyService->getStatistics();
            return $this->successResponse($statistics, 'Warranty statistics retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve warranty statistics: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update warranty information for an asset
     * 
     * @param Request $request
     * @param int $assetId
     * @return JsonResponse
     */
    public function update(Request $request, int $assetId): JsonResponse
    {
        try {
            $validated = $request->validate([
                'start_date' => 'required|date',
                'warranty_months' => 'required|integer|min:1',
                'provider' => 'nullable|string|max:255',
                'warranty_type_id' => 'nullable|integer',
                'terms' => 'nullable|string',
                'coverage_details' => 'nullable|string',
            ]);

            $dto = WarrantyDTO::fromRequest($validated);
            $result = $this->warrantyService->updateWarranty($assetId, $dto);

            if (!$result) {
                return $this->errorResponse('Failed to update warranty information', 500);
            }

            return $this->successResponse(null, 'Warranty information updated successfully');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->errorResponse('Validation failed: ' . json_encode($e->errors()), 422);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to update warranty information: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Check if warranty is valid for an asset
     * 
     * @param int $assetId
     * @return JsonResponse
     */
    public function checkValidity(int $assetId): JsonResponse
    {
        try {
            $isValid = $this->warrantyService->isWarrantyValid($assetId);
            return $this->successResponse([
                'asset_id' => $assetId,
                'is_valid' => $isValid,
            ], 'Warranty validity checked successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to check warranty validity: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get warranty expiry alerts
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function getExpiryAlerts(Request $request): JsonResponse
    {
        try {
            $days = $request->input('days', 30);
            $alerts = $this->warrantyService->getExpiryAlerts($days);
            return $this->successResponse($alerts, 'Warranty expiry alerts retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve warranty expiry alerts: ' . $e->getMessage(), 500);
        }
    }
}
