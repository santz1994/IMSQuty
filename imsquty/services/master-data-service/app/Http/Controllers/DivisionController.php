<?php

namespace App\Http\Controllers;

use App\Http\Requests\Division\CreateDivisionRequest;
use App\Http\Requests\Division\UpdateDivisionRequest;
use App\Http\Resources\DivisionResource;
use App\Services\DivisionService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DivisionController extends Controller
{
    public function __construct(private DivisionService $service) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only(['search', 'is_active', 'parent_id', 'manager_id', 'with_trashed', 'sort_by', 'sort_order']);
            $divisions = $this->service->getAllDivisions($filters, $request->input('per_page', 15));
            
            return response()->json([
                'success' => true,
                'data' => [
                    'data' => DivisionResource::collection($divisions->items()),
                    'meta' => [
                        'current_page' => $divisions->currentPage(),
                        'total' => $divisions->total(),
                        'per_page' => $divisions->perPage(),
                        'last_page' => $divisions->lastPage(),
                    ]
                ],
                'message' => 'Divisions retrieved successfully'
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
                'data' => new DivisionResource($this->service->getDivisionById($id)),
                'message' => 'Division retrieved successfully'
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function store(CreateDivisionRequest $request): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => new DivisionResource($this->service->createDivision($request->validated())),
                'message' => 'Division created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    public function update(UpdateDivisionRequest $request, int $id): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => new DivisionResource($this->service->updateDivision($id, $request->validated())),
                'message' => 'Division updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->service->deleteDivision($id);
            return response()->json(['success' => true, 'message' => 'Division deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    public function restore(int $id): JsonResponse
    {
        try {
            $this->service->restoreDivision($id);
            return response()->json(['success' => true, 'message' => 'Division restored successfully']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    public function active(): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => DivisionResource::collection($this->service->getActiveDivisions()),
                'message' => 'Active divisions retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function hierarchy(): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => $this->service->getDivisionsHierarchy(),
                'message' => 'Divisions hierarchy retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
