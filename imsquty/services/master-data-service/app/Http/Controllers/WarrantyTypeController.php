<?php

namespace App\Http\Controllers;

use App\Http\Requests\WarrantyType\CreateWarrantyTypeRequest;
use App\Http\Requests\WarrantyType\UpdateWarrantyTypeRequest;
use App\Http\Resources\WarrantyTypeResource;
use App\Services\WarrantyTypeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WarrantyTypeController extends Controller
{
    public function __construct(private WarrantyTypeService $service) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only(['search', 'is_active', 'with_trashed', 'sort_by', 'sort_order']);
            $warrantyTypes = $this->service->getAllWarrantyTypes($filters, $request->input('per_page', 15));
            
            return response()->json([
                'success' => true,
                'data' => [
                    'data' => WarrantyTypeResource::collection($warrantyTypes->items()),
                    'meta' => [
                        'current_page' => $warrantyTypes->currentPage(),
                        'total' => $warrantyTypes->total(),
                        'per_page' => $warrantyTypes->perPage(),
                        'last_page' => $warrantyTypes->lastPage(),
                    ]
                ],
                'message' => 'Warranty types retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => new WarrantyTypeResource($this->service->getWarrantyTypeById($id)),
                'message' => 'Warranty type retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    public function store(CreateWarrantyTypeRequest $request): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => new WarrantyTypeResource($this->service->createWarrantyType($request->validated())),
                'message' => 'Warranty type created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    public function update(UpdateWarrantyTypeRequest $request, int $id): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => new WarrantyTypeResource($this->service->updateWarrantyType($id, $request->validated())),
                'message' => 'Warranty type updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->service->deleteWarrantyType($id);
            return response()->json(['success' => true, 'message' => 'Warranty type deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    public function restore(int $id): JsonResponse
    {
        try {
            $this->service->restoreWarrantyType($id);
            return response()->json(['success' => true, 'message' => 'Warranty type restored successfully']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    public function active(): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => WarrantyTypeResource::collection($this->service->getActiveWarrantyTypes()),
                'message' => 'Active warranty types retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
