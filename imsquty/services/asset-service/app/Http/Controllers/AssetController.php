<?php

namespace App\Http\Controllers;

use App\Services\AssetService;
use App\Http\Requests\CreateAssetRequest;
use App\Http\Requests\UpdateAssetRequest;
use App\Http\Requests\AssignAssetRequest;
use App\Http\Requests\TransferAssetRequest;
use App\Http\Requests\ScheduleMaintenanceRequest;
use App\Http\Resources\AssetResource;
use App\Http\Resources\AssetCollection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Asset Controller
 * 
 * Handles HTTP requests for Asset management.
 * Thin controller - delegates business logic to AssetService.
 */
class AssetController extends Controller
{
    /**
     * @var AssetService
     */
    protected $assetService;

    /**
     * Constructor
     *
     * @param AssetService $assetService
     */
    public function __construct(AssetService $assetService)
    {
        $this->assetService = $assetService;
    }

    /**
     * Get all assets with filters
     * 
     * @OA\Get(
     *     path="/api/v1/assets",
     *     summary="Get all assets",
     *     tags={"Assets"},
     *     @OA\Parameter(name="search", in="query", description="Search term"),
     *     @OA\Parameter(name="status_id", in="query", description="Filter by status"),
     *     @OA\Parameter(name="asset_type_id", in="query", description="Filter by asset type"),
     *     @OA\Parameter(name="division_id", in="query", description="Filter by division"),
     *     @OA\Parameter(name="location_id", in="query", description="Filter by location"),
     *     @OA\Parameter(name="assigned_to", in="query", description="Filter by assigned user"),
     *     @OA\Parameter(name="is_assigned", in="query", description="Filter by assignment status"),
     *     @OA\Parameter(name="warranty_status", in="query", description="Filter by warranty status"),
     *     @OA\Parameter(name="per_page", in="query", description="Items per page"),
     *     @OA\Response(response=200, description="Success")
     * )
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only([
                'search',
                'status_id',
                'asset_type_id',
                'division_id',
                'location_id',
                'assigned_to',
                'is_assigned',
                'is_active',
                'warranty_status',
                'with_trashed',
                'sort_by',
                'sort_order',
            ]);

            $perPage = $request->input('per_page', 15);
            
            $assets = $this->assetService->getAllAssets($filters, $perPage);

            return response()->json([
                'success' => true,
                'data' => new AssetCollection($assets),
                'message' => 'Assets retrieved successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to retrieve assets',
            ], 500);
        }
    }

    /**
     * Get asset by ID
     * 
     * @OA\Get(
     *     path="/api/v1/assets/{id}",
     *     summary="Get asset by ID",
     *     tags={"Assets"},
     *     @OA\Parameter(name="id", in="path", required=true, description="Asset ID"),
     *     @OA\Response(response=200, description="Success"),
     *     @OA\Response(response=404, description="Not found")
     * )
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $asset = $this->assetService->getAssetById($id);

            return response()->json([
                'success' => true,
                'data' => new AssetResource($asset),
                'message' => 'Asset retrieved successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Asset not found',
            ], 404);
        }
    }

    /**
     * Get asset by QR code
     * 
     * @OA\Get(
     *     path="/api/v1/assets/qr/{qrCode}",
     *     summary="Get asset by QR code",
     *     tags={"Assets"},
     *     @OA\Parameter(name="qrCode", in="path", required=true, description="QR Code"),
     *     @OA\Response(response=200, description="Success"),
     *     @OA\Response(response=404, description="Not found")
     * )
     *
     * @param string $qrCode
     * @return JsonResponse
     */
    public function qrCode(string $qrCode): JsonResponse
    {
        try {
            $asset = $this->assetService->getAssetByQrCode($qrCode);

            return response()->json([
                'success' => true,
                'data' => new AssetResource($asset),
                'message' => 'Asset retrieved successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Asset not found',
            ], 404);
        }
    }

    /**
     * Create new asset
     * 
     * @OA\Post(
     *     path="/api/v1/assets",
     *     summary="Create new asset",
     *     tags={"Assets"},
     *     @OA\RequestBody(required=true, description="Asset data"),
     *     @OA\Response(response=201, description="Created"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     *
     * @param CreateAssetRequest $request
     * @return JsonResponse
     */
    public function store(CreateAssetRequest $request): JsonResponse
    {
        try {
            $asset = $this->assetService->createAsset($request->validated());

            return response()->json([
                'success' => true,
                'data' => new AssetResource($asset),
                'message' => 'Asset created successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to create asset',
            ], 500);
        }
    }

    /**
     * Update asset
     * 
     * @OA\Put(
     *     path="/api/v1/assets/{id}",
     *     summary="Update asset",
     *     tags={"Assets"},
     *     @OA\Parameter(name="id", in="path", required=true, description="Asset ID"),
     *     @OA\RequestBody(required=true, description="Asset data"),
     *     @OA\Response(response=200, description="Success"),
     *     @OA\Response(response=404, description="Not found")
     * )
     *
     * @param UpdateAssetRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateAssetRequest $request, int $id): JsonResponse
    {
        try {
            $asset = $this->assetService->updateAsset($id, $request->validated());

            return response()->json([
                'success' => true,
                'data' => new AssetResource($asset),
                'message' => 'Asset updated successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to update asset',
            ], 500);
        }
    }

    /**
     * Delete asset (soft delete)
     * 
     * @OA\Delete(
     *     path="/api/v1/assets/{id}",
     *     summary="Delete asset",
     *     tags={"Assets"},
     *     @OA\Parameter(name="id", in="path", required=true, description="Asset ID"),
     *     @OA\Response(response=200, description="Success"),
     *     @OA\Response(response=404, description="Not found")
     * )
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->assetService->deleteAsset($id);

            return response()->json([
                'success' => true,
                'message' => 'Asset deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to delete asset',
            ], 500);
        }
    }

    /**
     * Restore deleted asset
     * 
     * @OA\Post(
     *     path="/api/v1/assets/{id}/restore",
     *     summary="Restore deleted asset",
     *     tags={"Assets"},
     *     @OA\Parameter(name="id", in="path", required=true, description="Asset ID"),
     *     @OA\Response(response=200, description="Success"),
     *     @OA\Response(response=404, description="Not found")
     * )
     *
     * @param int $id
     * @return JsonResponse
     */
    public function restore(int $id): JsonResponse
    {
        try {
            $this->assetService->restoreAsset($id);

            return response()->json([
                'success' => true,
                'message' => 'Asset restored successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to restore asset',
            ], 500);
        }
    }

    /**
     * Assign asset to user
     * 
     * @OA\Post(
     *     path="/api/v1/assets/{id}/assign",
     *     summary="Assign asset to user",
     *     tags={"Assets"},
     *     @OA\Parameter(name="id", in="path", required=true, description="Asset ID"),
     *     @OA\RequestBody(required=true, description="Assignment data"),
     *     @OA\Response(response=200, description="Success")
     * )
     *
     * @param AssignAssetRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function assign(AssignAssetRequest $request, int $id): JsonResponse
    {
        try {
            $data = $request->validated();
            $asset = $this->assetService->assignAsset($id, $data['user_id'], $data);

            return response()->json([
                'success' => true,
                'data' => new AssetResource($asset),
                'message' => 'Asset assigned successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to assign asset',
            ], 500);
        }
    }

    /**
     * Transfer asset (location/user)
     * 
     * @OA\Post(
     *     path="/api/v1/assets/{id}/transfer",
     *     summary="Transfer asset",
     *     tags={"Assets"},
     *     @OA\Parameter(name="id", in="path", required=true, description="Asset ID"),
     *     @OA\RequestBody(required=true, description="Transfer data"),
     *     @OA\Response(response=200, description="Success")
     * )
     *
     * @param TransferAssetRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function transfer(TransferAssetRequest $request, int $id): JsonResponse
    {
        try {
            $asset = $this->assetService->transferAsset($id, $request->validated());

            return response()->json([
                'success' => true,
                'data' => new AssetResource($asset),
                'message' => 'Asset transferred successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to transfer asset',
            ], 500);
        }
    }

    /**
     * Get assets with expiring warranties
     * 
     * @OA\Get(
     *     path="/api/v1/assets/warranties/expiring",
     *     summary="Get assets with expiring warranties",
     *     tags={"Assets"},
     *     @OA\Parameter(name="days", in="query", description="Days threshold (default 30)"),
     *     @OA\Response(response=200, description="Success")
     * )
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function expiringWarranties(Request $request): JsonResponse
    {
        try {
            $days = $request->input('days', 30);
            $assets = $this->assetService->getExpiringWarranties($days);

            return response()->json([
                'success' => true,
                'data' => AssetResource::collection($assets),
                'message' => 'Expiring warranties retrieved successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to retrieve expiring warranties',
            ], 500);
        }
    }

    /**
     * Get asset statistics
     * 
     * @OA\Get(
     *     path="/api/v1/assets/statistics",
     *     summary="Get asset statistics",
     *     tags={"Assets"},
     *     @OA\Response(response=200, description="Success")
     * )
     *
     * @return JsonResponse
     */
    public function statistics(): JsonResponse
    {
        try {
            $statistics = $this->assetService->getAssetStatistics();

            return response()->json([
                'success' => true,
                'data' => $statistics,
                'message' => 'Statistics retrieved successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to retrieve statistics',
            ], 500);
        }
    }
}
