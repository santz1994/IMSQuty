<?php

namespace App\Http\Controllers;

use App\Http\Requests\Supplier\CreateSupplierRequest;
use App\Http\Requests\Supplier\UpdateSupplierRequest;
use App\Http\Resources\SupplierResource;
use App\Services\SupplierService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Shared\Traits\ApiResponses;

class SupplierController extends Controller
{
    use ApiResponses;

    public function __construct(private SupplierService $service) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'is_active', 'city', 'country', 'with_trashed', 'sort_by', 'sort_order']);
        $perPage = $request->input('per_page', 15);
        
        $suppliers = $this->service->getAllSuppliers($filters, $perPage);
        
        return $this->paginatedResponse(
            SupplierResource::collection($suppliers->items())->resolve(),
            $suppliers,
            'Suppliers retrieved successfully'
        );
    }

    public function show(int $id): JsonResponse
    {
        try {
            $supplier = $this->service->getSupplierById($id);
            return $this->successResponse(
                (new SupplierResource($supplier))->resolve(),
                'Supplier retrieved successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('Supplier not found');
        }
    }

    public function store(CreateSupplierRequest $request): JsonResponse
    {
        $supplier = $this->service->createSupplier($request->validated());
        return $this->createdResponse(
            (new SupplierResource($supplier))->resolve(),
            'Supplier created successfully'
        );
    }

    public function update(UpdateSupplierRequest $request, int $id): JsonResponse
    {
        try {
            $supplier = $this->service->updateSupplier($id, $request->validated());
            return $this->successResponse(
                (new SupplierResource($supplier))->resolve(),
                'Supplier updated successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('Supplier not found');
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->service->deleteSupplier($id);
            return $this->deletedResponse('Supplier deleted successfully');
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('Supplier not found');
        }
    }

    public function restore(int $id): JsonResponse
    {
        try {
            $this->service->restoreSupplier($id);
            return $this->successResponse(null, 'Supplier restored successfully');
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('Supplier not found');
        }
    }

    public function active(): JsonResponse
    {
        $suppliers = $this->service->getActiveSuppliers();
        return $this->successResponse(
            SupplierResource::collection($suppliers)->resolve(),
            'Active suppliers retrieved successfully'
        );
    }
}
