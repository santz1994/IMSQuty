<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateInventoryItemRequest;
use App\Http\Requests\UpdateInventoryItemRequest;
use App\Http\Requests\UpdateStockRequest;
use App\Http\Resources\InventoryItemResource;
use App\Services\InventoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Shared\Traits\ApiResponses;

class InventoryController extends Controller
{
    use ApiResponses;
    public function __construct(private InventoryService $service) {}

    public function index(Request $request): JsonResponse
    {
        $items = $this->service->getAll(
            $request->input('per_page', 15),
            $request->only(['category', 'search'])
        );

        return $this->paginatedResponse($items, 'Inventory items retrieved successfully', InventoryItemResource::class);
    }

    public function show(int $id): JsonResponse
    {
        $item = $this->service->getById($id);
        if (!$item) return $this->notFoundResponse('Item not found');
        return $this->successResponse(new InventoryItemResource($item), 'Item retrieved successfully');
    }

    public function store(CreateInventoryItemRequest $request): JsonResponse
    {
        $item = $this->service->create($request->validated());
        return $this->createdResponse(new InventoryItemResource($item), 'Item created successfully');
    }

    public function update(int $id, UpdateInventoryItemRequest $request): JsonResponse
    {
        $result = $this->service->update($id, $request->validated());
        if (!$result) return $this->notFoundResponse('Item not found');
        return $this->successResponse(null, 'Item updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $result = $this->service->delete($id);
        if (!$result) return $this->notFoundResponse('Item not found');
        return $this->deletedResponse('Item deleted successfully');
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
