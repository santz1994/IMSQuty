<?php

namespace App\Http\Controllers;

use App\Http\Requests\Pcspec\CreatePcspecRequest;
use App\Http\Requests\Pcspec\UpdatePcspecRequest;
use App\Http\Resources\PcspecResource;
use App\Services\PcspecService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PcspecController extends Controller
{
    public function __construct(private PcspecService $service) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only(['search', 'is_active', 'cpu', 'ram', 'with_trashed', 'sort_by', 'sort_order']);
            $pcspecs = $this->service->getAllPcspecs($filters, $request->input('per_page', 15));
            
            return response()->json([
                'success' => true,
                'data' => [
                    'data' => PcspecResource::collection($pcspecs->items()),
                    'meta' => [
                        'current_page' => $pcspecs->currentPage(),
                        'total' => $pcspecs->total(),
                        'per_page' => $pcspecs->perPage(),
                        'last_page' => $pcspecs->lastPage(),
                    ]
                ],
                'message' => 'PC specifications retrieved successfully'
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
                'data' => new PcspecResource($this->service->getPcspecById($id)),
                'message' => 'PC specification retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    public function store(CreatePcspecRequest $request): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => new PcspecResource($this->service->createPcspec($request->validated())),
                'message' => 'PC specification created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    public function update(UpdatePcspecRequest $request, int $id): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => new PcspecResource($this->service->updatePcspec($id, $request->validated())),
                'message' => 'PC specification updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->service->deletePcspec($id);
            return response()->json(['success' => true, 'message' => 'PC specification deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    public function restore(int $id): JsonResponse
    {
        try {
            $this->service->restorePcspec($id);
            return response()->json(['success' => true, 'message' => 'PC specification restored successfully']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    public function active(): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => PcspecResource::collection($this->service->getActivePcspecs()),
                'message' => 'Active PC specifications retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
