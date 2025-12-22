<?php

namespace App\Http\Controllers;

use App\Http\Requests\Supplier\CreateSupplierRequest;
use App\Http\Requests\Supplier\UpdateSupplierRequest;
use App\Http\Resources\SupplierResource;
use App\Services\SupplierService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function __construct(private SupplierService $service) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only(['search', 'is_active', 'city', 'country', 'with_trashed', 'sort_by', 'sort_order']);
            $suppliers = $this->service->getAllSuppliers($filters, $request->input('per_page', 15));
            
            return response()->json([
                'success' => true,
                'data' => [
                    'data' => SupplierResource::collection($suppliers->items()),
                    'meta' => [
                        'current_page' => $suppliers->currentPage(),
                        'total' => $suppliers->total(),
                        'per_page' => $suppliers->perPage(),
                        'last_page' => $suppliers->lastPage(),
                    ]
                ],
                'message' => 'Suppliers retrieved successfully'
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
                'data' => new SupplierResource($this->service->getSupplierById($id)),
                'message' => 'Supplier retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    public function store(CreateSupplierRequest $request): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => new SupplierResource($this->service->createSupplier($request->validated())),
                'message' => 'Supplier created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    public function update(UpdateSupplierRequest $request, int $id): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => new SupplierResource($this->service->updateSupplier($id, $request->validated())),
                'message' => 'Supplier updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->service->deleteSupplier($id);
            return response()->json(['success' => true, 'message' => 'Supplier deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    public function restore(int $id): JsonResponse
    {
        try {
            $this->service->restoreSupplier($id);
            return response()->json(['success' => true, 'message' => 'Supplier restored successfully']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    public function active(): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => SupplierResource::collection($this->service->getActiveSuppliers()),
                'message' => 'Active suppliers retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
