<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateInventoryItemRequest;
use App\Http\Requests\UpdateInventoryItemRequest;
use App\Http\Requests\UpdateStockRequest;
use App\Http\Resources\InventoryItemResource;
use App\Services\InventoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function __construct(private InventoryService $service) {}

    public function index(Request $request): JsonResponse
    {
        $items = $this->service->getAll(
            $request->input('per_page', 15),
            $request->only(['category', 'search'])
        );

        return response()->json([
            'success' => true,
            'data' => [
                'data' => InventoryItemResource::collection($items->items()),
                'current_page' => $items->currentPage(),
                'total' => $items->total(),
                'per_page' => $items->perPage(),
                'last_page' => $items->lastPage(),
            ],
            'message' => 'Inventory items retrieved successfully'
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $item = $this->service->getById($id);

        if (!$item) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'NOT_FOUND'],
                'message' => 'Item not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new InventoryItemResource($item),
            'message' => 'Item retrieved successfully'
        ]);
    }

    public function store(CreateInventoryItemRequest $request): JsonResponse
    {
        $item = $this->service->create($request->validated());

        return response()->json([
            'success' => true,
            'data' => new InventoryItemResource($item),
            'message' => 'Item created successfully'
        ], 201);
    }

    public function update(int $id, UpdateInventoryItemRequest $request): JsonResponse
    {
        $result = $this->service->update($id, $request->validated());

        if (!$result) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'NOT_FOUND'],
                'message' => 'Item not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Item updated successfully'
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $result = $this->service->delete($id);

        if (!$result) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'NOT_FOUND'],
                'message' => 'Item not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Item deleted successfully'
        ]);
    }

    public function lowStock(): JsonResponse
    {
        $items = $this->service->getLowStock();

        return response()->json([
            'success' => true,
            'data' => [
                'data' => InventoryItemResource::collection($items),
            ],
            'message' => 'Low stock items retrieved'
        ]);
    }

    public function addStock(int $id, UpdateStockRequest $request): JsonResponse
    {
        $details = $request->validated();
        $details['moved_by'] = auth()->id();
        $result = $this->service->addStock($id, $request->input('quantity'), $details);

        return response()->json([
            'success' => $result,
            'message' => $result ? 'Stock added successfully' : 'Failed to add stock'
        ], $result ? 200 : 400);
    }

    public function reduceStock(int $id, UpdateStockRequest $request): JsonResponse
    {
        $details = $request->validated();
        $details['moved_by'] = auth()->id();
        $result = $this->service->reduceStock($id, $request->input('quantity'), $details);

        return response()->json([
            'success' => $result,
            'message' => $result ? 'Stock reduced successfully' : 'Insufficient stock'
        ], $result ? 200 : 400);
    }

    public function statistics(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->service->getStatistics(),
            'message' => 'Statistics retrieved'
        ]);
    }

    public function transferStock(int $id, UpdateStockRequest $request): JsonResponse
    {
        $details = $request->validated();
        $details['moved_by'] = auth()->id();
        $toWarehouseId = $request->input('to_warehouse_id');
        
        $result = $this->service->transferStock($id, $toWarehouseId, $request->input('quantity'), $details);

        return response()->json([
            'success' => $result,
            'message' => $result ? 'Stock transferred successfully' : 'Transfer failed'
        ], $result ? 200 : 400);
    }
}
