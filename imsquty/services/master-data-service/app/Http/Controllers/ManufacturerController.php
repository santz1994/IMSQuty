<?php

namespace App\Http\Controllers;

use App\Http\Requests\Manufacturer\CreateManufacturerRequest;
use App\Http\Requests\Manufacturer\UpdateManufacturerRequest;
use App\Http\Resources\ManufacturerResource;
use App\Services\ManufacturerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ManufacturerController extends Controller
{
    public function __construct(private ManufacturerService $service) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only(['search', 'is_active', 'with_trashed', 'sort_by', 'sort_order']);
            $manufacturers = $this->service->getAllManufacturers($filters, $request->input('per_page', 15));
            
            return response()->json([
                'success' => true,
                'data' => [
                    'data' => ManufacturerResource::collection($manufacturers->items()),
                    'meta' => [
                        'current_page' => $manufacturers->currentPage(),
                        'total' => $manufacturers->total(),
                        'per_page' => $manufacturers->perPage(),
                        'last_page' => $manufacturers->lastPage(),
                    ]
                ],
                'message' => 'Manufacturers retrieved successfully'
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
                'data' => new ManufacturerResource($this->service->getManufacturerById($id)),
                'message' => 'Manufacturer retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    public function store(CreateManufacturerRequest $request): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => new ManufacturerResource($this->service->createManufacturer($request->validated())),
                'message' => 'Manufacturer created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    public function update(UpdateManufacturerRequest $request, int $id): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => new ManufacturerResource($this->service->updateManufacturer($id, $request->validated())),
                'message' => 'Manufacturer updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->service->deleteManufacturer($id);
            return response()->json(['success' => true, 'message' => 'Manufacturer deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    public function restore(int $id): JsonResponse
    {
        try {
            $this->service->restoreManufacturer($id);
            return response()->json(['success' => true, 'message' => 'Manufacturer restored successfully']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    public function active(): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => ManufacturerResource::collection($this->service->getActiveManufacturers()),
                'message' => 'Active manufacturers retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
