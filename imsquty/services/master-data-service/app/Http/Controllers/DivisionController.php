<?php

namespace App\Http\Controllers;

use App\Http\Requests\Division\CreateDivisionRequest;
use App\Http\Requests\Division\UpdateDivisionRequest;
use App\Http\Resources\DivisionResource;
use App\Services\DivisionService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Shared\Traits\ApiResponses;

class DivisionController extends Controller
{
    use ApiResponses;

    public function __construct(private DivisionService $service) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'is_active', 'parent_id', 'manager_id', 'with_trashed', 'sort_by', 'sort_order']);
        $perPage = $request->input('per_page', 15);
        
        $divisions = $this->service->getAllDivisions($filters, $perPage);
        
        return $this->paginatedResponse(
            DivisionResource::collection($divisions->items())->resolve(),
            $divisions,
            'Divisions retrieved successfully'
        );
    }

    public function show(int $id): JsonResponse
    {
        try {
            $division = $this->service->getDivisionById($id);
            return $this->successResponse(
                (new DivisionResource($division))->resolve(),
                'Division retrieved successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('Division not found');
        }
    }

    public function store(CreateDivisionRequest $request): JsonResponse
    {
        $division = $this->service->createDivision($request->validated());
        return $this->createdResponse(
            (new DivisionResource($division))->resolve(),
            'Division created successfully'
        );
    }

    public function update(UpdateDivisionRequest $request, int $id): JsonResponse
    {
        try {
            $division = $this->service->updateDivision($id, $request->validated());
            return $this->successResponse(
                (new DivisionResource($division))->resolve(),
                'Division updated successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('Division not found');
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->service->deleteDivision($id);
            return $this->deletedResponse('Division deleted successfully');
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('Division not found');
        }
    }

    public function restore(int $id): JsonResponse
    {
        try {
            $this->service->restoreDivision($id);
            return $this->successResponse(null, 'Division restored successfully');
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('Division not found');
        }
    }

    public function active(): JsonResponse
    {
        $divisions = $this->service->getActiveDivisions();
        return $this->successResponse(
            DivisionResource::collection($divisions)->resolve(),
            'Active divisions retrieved successfully'
        );
    }

    public function hierarchy(): JsonResponse
    {
        $hierarchy = $this->service->getDivisionsHierarchy();
        return $this->successResponse($hierarchy, 'Divisions hierarchy retrieved successfully');
    }
}
