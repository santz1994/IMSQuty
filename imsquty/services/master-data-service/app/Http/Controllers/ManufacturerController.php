<?php

namespace App\Http\Controllers;

use App\Http\Requests\Manufacturer\CreateManufacturerRequest;
use App\Http\Requests\Manufacturer\UpdateManufacturerRequest;
use App\Http\Resources\ManufacturerResource;
use App\Services\ManufacturerService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Shared\Traits\ApiResponses;

class ManufacturerController extends Controller
{
    use ApiResponses;

    public function __construct(private ManufacturerService $service) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'is_active', 'with_trashed', 'sort_by', 'sort_order']);
        $perPage = $request->input('per_page', 15);
        
        $manufacturers = $this->service->getAllManufacturers($filters, $perPage);
        
        return $this->paginatedResponse(
            ManufacturerResource::collection($manufacturers->items())->resolve(),
            $manufacturers,
            'Manufacturers retrieved successfully'
        );
    }

    public function show(int $id): JsonResponse
    {
        try {
            $manufacturer = $this->service->getManufacturerById($id);
            return $this->successResponse(
                (new ManufacturerResource($manufacturer))->resolve(),
                'Manufacturer retrieved successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('Manufacturer not found');
        }
    }

    public function store(CreateManufacturerRequest $request): JsonResponse
    {
        $manufacturer = $this->service->createManufacturer($request->validated());
        return $this->createdResponse(
            (new ManufacturerResource($manufacturer))->resolve(),
            'Manufacturer created successfully'
        );
    }

    public function update(UpdateManufacturerRequest $request, int $id): JsonResponse
    {
        try {
            $manufacturer = $this->service->updateManufacturer($id, $request->validated());
            return $this->successResponse(
                (new ManufacturerResource($manufacturer))->resolve(),
                'Manufacturer updated successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('Manufacturer not found');
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->service->deleteManufacturer($id);
            return $this->deletedResponse('Manufacturer deleted successfully');
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('Manufacturer not found');
        }
    }

    public function restore(int $id): JsonResponse
    {
        try {
            $this->service->restoreManufacturer($id);
            return $this->successResponse(null, 'Manufacturer restored successfully');
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('Manufacturer not found');
        }
    }

    public function active(): JsonResponse
    {
        $manufacturers = $this->service->getActiveManufacturers();
        return $this->successResponse(
            ManufacturerResource::collection($manufacturers)->resolve(),
            'Active manufacturers retrieved successfully'
        );
    }
}
