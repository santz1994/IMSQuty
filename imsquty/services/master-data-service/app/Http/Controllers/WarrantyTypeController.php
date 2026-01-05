<?php

namespace App\Http\Controllers;

use App\Http\Requests\WarrantyType\CreateWarrantyTypeRequest;
use App\Http\Requests\WarrantyType\UpdateWarrantyTypeRequest;
use App\Http\Resources\WarrantyTypeResource;
use App\Services\WarrantyTypeService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Shared\Traits\ApiResponses;

class WarrantyTypeController extends Controller
{
    use ApiResponses;

    public function __construct(private WarrantyTypeService $service) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'is_active', 'with_trashed', 'sort_by', 'sort_order']);
        $perPage = $request->input('per_page', 15);
        
        $warrantyTypes = $this->service->getAllWarrantyTypes($filters, $perPage);
        
        return $this->paginatedResponse(
            WarrantyTypeResource::collection($warrantyTypes->items())->resolve(),
            $warrantyTypes,
            'Warranty types retrieved successfully'
        );
    }

    public function show(int $id): JsonResponse
    {
        try {
            $warrantyType = $this->service->getWarrantyTypeById($id);
            return $this->successResponse(
                (new WarrantyTypeResource($warrantyType))->resolve(),
                'Warranty type retrieved successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('Warranty type not found');
        }
    }

    public function store(CreateWarrantyTypeRequest $request): JsonResponse
    {
        $warrantyType = $this->service->createWarrantyType($request->validated());
        return $this->createdResponse(
            (new WarrantyTypeResource($warrantyType))->resolve(),
            'Warranty type created successfully'
        );
    }

    public function update(UpdateWarrantyTypeRequest $request, int $id): JsonResponse
    {
        try {
            $warrantyType = $this->service->updateWarrantyType($id, $request->validated());
            return $this->successResponse(
                (new WarrantyTypeResource($warrantyType))->resolve(),
                'Warranty type updated successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('Warranty type not found');
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->service->deleteWarrantyType($id);
            return $this->deletedResponse('Warranty type deleted successfully');
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('Warranty type not found');
        }
    }

    public function restore(int $id): JsonResponse
    {
        try {
            $this->service->restoreWarrantyType($id);
            return $this->successResponse(null, 'Warranty type restored successfully');
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('Warranty type not found');
        }
    }

    public function active(): JsonResponse
    {
        $warrantyTypes = $this->service->getActiveWarrantyTypes();
        return $this->successResponse(
            WarrantyTypeResource::collection($warrantyTypes)->resolve(),
            'Active warranty types retrieved successfully'
        );
    }
}
