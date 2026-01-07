<?php

namespace App\Http\Controllers;

use App\Http\Requests\BatchUpdateStockRequest;
use App\Http\Requests\CreateInventoryItemRequest;
use App\Http\Requests\CreateStockAdjustmentRequest;
use App\Http\Requests\UpdateInventoryItemRequest;
use App\Http\Requests\UpdateStockRequest;
use App\Http\Resources\InventoryItemResource;
use App\Http\Resources\StockMovementResource;
use App\Services\InventoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Shared\Traits\ApiResponses;

class InventoryController extends Controller
{
    use ApiResponses;
    
    public function __construct(private InventoryService $service) {}

    /**
     * List all inventory items with filters
     * GET /api/v1/items
     */
    public function index(Request $request): JsonResponse
    {
        $items = $this->service->getAll(
            $request->input('per_page', 15),
            $request->only(['category', 'search', 'warehouse_id', 'low_stock'])
        );

        return $this->paginatedResponse(
            $items, 
            'Inventory items retrieved successfully', 
            InventoryItemResource::class
        );
    }

    /**
     * Get single inventory item
     * GET /api/v1/items/{id}
     */
    public function show(int $id): JsonResponse
    {
        $item = $this->service->getById($id);
        if (!$item) {
            return $this->notFoundResponse('Item not found');
        }
        
        return $this->successResponse(
            new InventoryItemResource($item), 
            'Item retrieved successfully'
        );
    }

    /**
     * Create new inventory item
     * POST /api/v1/items
     */
    public function store(CreateInventoryItemRequest $request): JsonResponse
    {
        $item = $this->service->create($request->validated());
        
        return $this->createdResponse(
            new InventoryItemResource($item), 
            'Item created successfully'
        );
    }

    /**
     * Update inventory item
     * PUT /api/v1/items/{id}
     */
    public function update(int $id, UpdateInventoryItemRequest $request): JsonResponse
    {
        $result = $this->service->update($id, $request->validated());
        if (!$result) {
            return $this->notFoundResponse('Item not found');
        }
        
        return $this->successResponse(null, 'Item updated successfully');
    }

    /**
     * Delete inventory item
     * DELETE /api/v1/items/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $result = $this->service->delete($id);
        if (!$result) {
            return $this->notFoundResponse('Item not found');
        }
        
        return $this->deletedResponse('Item deleted successfully');
    }

    /**
     * Get low stock items
     * GET /api/v1/items/low-stock
     */
    public function lowStock(): JsonResponse
    {
        $items = $this->service->getLowStock();

        return $this->successResponse([
            'data' => InventoryItemResource::collection($items),
            'count' => $items->count()
        ], 'Low stock items retrieved');
    }

    /**
     * Get out of stock items
     * GET /api/v1/items/out-of-stock
     */
    public function outOfStock(): JsonResponse
    {
        $items = $this->service->getOutOfStock();

        return $this->successResponse([
            'data' => InventoryItemResource::collection($items),
            'count' => $items->count()
        ], 'Out of stock items retrieved');
    }

    /**
     * Add stock to item
     * POST /api/v1/items/{id}/stock-in
     */
    public function addStock(int $id, UpdateStockRequest $request): JsonResponse
    {
        $result = $this->service->addStock(
            $id, 
            $request->input('quantity'), 
            $request->validated()
        );

        if (!$result) {
            return $this->errorResponse('Failed to add stock', 400);
        }

        return $this->successResponse(null, 'Stock added successfully');
    }

    /**
     * Reduce stock from item
     * POST /api/v1/items/{id}/stock-out
     */
    public function reduceStock(int $id, UpdateStockRequest $request): JsonResponse
    {
        $result = $this->service->reduceStock(
            $id, 
            $request->input('quantity'), 
            $request->validated()
        );

        if (!$result) {
            return $this->errorResponse('Insufficient stock or item not found', 400);
        }

        return $this->successResponse(null, 'Stock reduced successfully');
    }

    /**
     * Transfer stock between warehouses
     * POST /api/v1/items/{id}/transfer
     */
    public function transferStock(int $id, UpdateStockRequest $request): JsonResponse
    {
        $result = $this->service->transferStock(
            $id, 
            $request->input('to_warehouse_id'), 
            $request->input('quantity'),
            $request->validated()
        );

        if (!$result) {
            return $this->errorResponse('Transfer failed', 400);
        }

        return $this->successResponse(null, 'Stock transferred successfully');
    }

    /**
     * Adjust stock (manual correction)
     * POST /api/v1/items/{id}/adjust
     */
    public function adjustStock(int $id, CreateStockAdjustmentRequest $request): JsonResponse
    {
        $result = $this->service->adjustStock(
            $id,
            $request->input('adjustment_type'),
            $request->input('quantity'),
            $request->validated()
        );

        if (!$result) {
            return $this->errorResponse('Adjustment failed', 400);
        }

        return $this->successResponse(null, 'Stock adjusted successfully');
    }

    /**
     * Batch update stock for multiple items
     * POST /api/v1/items/batch-update
     */
    public function batchUpdate(BatchUpdateStockRequest $request): JsonResponse
    {
        $results = $this->service->batchUpdateStock(
            $request->input('items'),
            $request->input('movement_type'),
            $request->only(['notes', 'reference_number'])
        );

        $successCount = collect($results)->where('success', true)->count();
        $failCount = collect($results)->where('success', false)->count();

        return $this->successResponse([
            'results' => $results,
            'summary' => [
                'total' => count($results),
                'success' => $successCount,
                'failed' => $failCount
            ]
        ], 'Batch update completed');
    }

    /**
     * Get stock movements for an item
     * GET /api/v1/items/{id}/movements
     */
    public function movements(int $id, Request $request): JsonResponse
    {
        $movements = $this->service->getStockMovements(
            $id, 
            $request->input('per_page', 15)
        );

        return $this->paginatedResponse(
            $movements,
            'Stock movements retrieved successfully',
            StockMovementResource::class
        );
    }

    /**
     * Get inventory statistics
     * GET /api/v1/items/statistics
     */
    public function statistics(): JsonResponse
    {
        $stats = $this->service->getDetailedStatistics();

        return $this->successResponse($stats, 'Statistics retrieved');
    }

    /**
     * Get stock valuation
     * GET /api/v1/items/valuation
     */
    public function valuation(Request $request): JsonResponse
    {
        $valuation = $this->service->getStockValuation(
            $request->only(['category', 'warehouse_id'])
        );

        return $this->successResponse($valuation, 'Stock valuation retrieved');
    }
}
