<?php

namespace App\Http\Controllers;

use App\Services\AssetModelService;
use App\Http\Requests\CreateAssetModelRequest;
use App\Http\Requests\UpdateAssetModelRequest;
use App\Http\Resources\AssetModelResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * AssetModel Controller
 * 
 * Handles HTTP requests for AssetModel management.
 * Thin controller - delegates business logic to AssetModelService.
 */
class AssetModelController extends Controller
{
    /**
     * @var AssetModelService
     */
    protected $assetModelService;

    /**
     * Constructor
     *
     * @param AssetModelService $assetModelService
     */
    public function __construct(AssetModelService $assetModelService)
    {
        $this->assetModelService = $assetModelService;
    }

    /**
     * Get all asset models with filters
     * 
     * @OA\Get(
     *     path="/api/v1/asset-models",
     *     summary="Get all asset models",
     *     tags={"Asset Models"},
     *     @OA\Parameter(name="search", in="query", description="Search term"),
     *     @OA\Parameter(name="asset_type_id", in="query", description="Filter by asset type"),
     *     @OA\Parameter(name="manufacturer_id", in="query", description="Filter by manufacturer"),
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
                'asset_type_id',
                'manufacturer_id',
                'pcspec_id',
                'with_trashed',
                'sort_by',
                'sort_order',
            ]);

            $perPage = $request->input('per_page', 15);
            
            $models = $this->assetModelService->getAllAssetModels($filters, $perPage);

            return response()->json([
                'success' => true,
                'data' => AssetModelResource::collection($models),
                'message' => 'Asset models retrieved successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to retrieve asset models',
            ], 500);
        }
    }

    /**
     * Get asset model by ID
     * 
     * @OA\Get(
     *     path="/api/v1/asset-models/{id}",
     *     summary="Get asset model by ID",
     *     tags={"Asset Models"},
     *     @OA\Parameter(name="id", in="path", required=true, description="Asset Model ID"),
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
            $model = $this->assetModelService->getAssetModelById($id);

            return response()->json([
                'success' => true,
                'data' => new AssetModelResource($model),
                'message' => 'Asset model retrieved successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Asset model not found',
            ], 404);
        }
    }

    /**
     * Create new asset model
     * 
     * @OA\Post(
     *     path="/api/v1/asset-models",
     *     summary="Create new asset model",
     *     tags={"Asset Models"},
     *     @OA\RequestBody(required=true, description="Asset model data"),
     *     @OA\Response(response=201, description="Created"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     *
     * @param CreateAssetModelRequest $request
     * @return JsonResponse
     */
    public function store(CreateAssetModelRequest $request): JsonResponse
    {
        try {
            $model = $this->assetModelService->createAssetModel($request->validated());

            return response()->json([
                'success' => true,
                'data' => new AssetModelResource($model),
                'message' => 'Asset model created successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to create asset model',
            ], 500);
        }
    }

    /**
     * Update asset model
     * 
     * @OA\Put(
     *     path="/api/v1/asset-models/{id}",
     *     summary="Update asset model",
     *     tags={"Asset Models"},
     *     @OA\Parameter(name="id", in="path", required=true, description="Asset Model ID"),
     *     @OA\RequestBody(required=true, description="Asset model data"),
     *     @OA\Response(response=200, description="Success"),
     *     @OA\Response(response=404, description="Not found")
     * )
     *
     * @param UpdateAssetModelRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateAssetModelRequest $request, int $id): JsonResponse
    {
        try {
            $model = $this->assetModelService->updateAssetModel($id, $request->validated());

            return response()->json([
                'success' => true,
                'data' => new AssetModelResource($model),
                'message' => 'Asset model updated successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to update asset model',
            ], 500);
        }
    }

    /**
     * Delete asset model (soft delete)
     * 
     * @OA\Delete(
     *     path="/api/v1/asset-models/{id}",
     *     summary="Delete asset model",
     *     tags={"Asset Models"},
     *     @OA\Parameter(name="id", in="path", required=true, description="Asset Model ID"),
     *     @OA\Response(response=200, description="Success"),
     *     @OA\Response(response=400, description="Cannot delete - has associated assets"),
     *     @OA\Response(response=404, description="Not found")
     * )
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->assetModelService->deleteAssetModel($id);

            return response()->json([
                'success' => true,
                'message' => 'Asset model deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to delete asset model',
            ], 400);
        }
    }

    /**
     * Restore deleted asset model
     * 
     * @OA\Post(
     *     path="/api/v1/asset-models/{id}/restore",
     *     summary="Restore deleted asset model",
     *     tags={"Asset Models"},
     *     @OA\Parameter(name="id", in="path", required=true, description="Asset Model ID"),
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
            $this->assetModelService->restoreAssetModel($id);

            return response()->json([
                'success' => true,
                'message' => 'Asset model restored successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to restore asset model',
            ], 500);
        }
    }

    /**
     * Get asset models by type
     * 
     * @OA\Get(
     *     path="/api/v1/asset-models/by-type/{typeId}",
     *     summary="Get asset models by type",
     *     tags={"Asset Models"},
     *     @OA\Parameter(name="typeId", in="path", required=true, description="Asset Type ID"),
     *     @OA\Response(response=200, description="Success")
     * )
     *
     * @param int $typeId
     * @return JsonResponse
     */
    public function byType(int $typeId): JsonResponse
    {
        try {
            $models = $this->assetModelService->getAssetModelsByType($typeId);

            return response()->json([
                'success' => true,
                'data' => AssetModelResource::collection($models),
                'message' => 'Asset models retrieved successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to retrieve asset models',
            ], 500);
        }
    }

    /**
     * Get asset models by manufacturer
     * 
     * @OA\Get(
     *     path="/api/v1/asset-models/by-manufacturer/{manufacturerId}",
     *     summary="Get asset models by manufacturer",
     *     tags={"Asset Models"},
     *     @OA\Parameter(name="manufacturerId", in="path", required=true, description="Manufacturer ID"),
     *     @OA\Response(response=200, description="Success")
     * )
     *
     * @param int $manufacturerId
     * @return JsonResponse
     */
    public function byManufacturer(int $manufacturerId): JsonResponse
    {
        try {
            $models = $this->assetModelService->getAssetModelsByManufacturer($manufacturerId);

            return response()->json([
                'success' => true,
                'data' => AssetModelResource::collection($models),
                'message' => 'Asset models retrieved successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to retrieve asset models',
            ], 500);
        }
    }
}
