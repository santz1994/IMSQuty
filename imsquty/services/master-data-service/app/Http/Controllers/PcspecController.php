<?php

namespace App\Http\Controllers;

use App\Http\Requests\Pcspec\CreatePcspecRequest;
use App\Http\Requests\Pcspec\UpdatePcspecRequest;
use App\Http\Resources\PcspecResource;
use App\Services\PcspecService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Shared\Traits\ApiResponses;

class PcspecController extends Controller
{
    use ApiResponses;

    public function __construct(private PcspecService $service) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'is_active', 'cpu', 'ram', 'with_trashed', 'sort_by', 'sort_order']);
        $perPage = $request->input('per_page', 15);
        
        $pcspecs = $this->service->getAllPcspecs($filters, $perPage);
        
        return $this->paginatedResponse(
            PcspecResource::collection($pcspecs->items())->resolve(),
            $pcspecs,
            'PC specifications retrieved successfully'
        );
    }

    public function show(int $id): JsonResponse
    {
        try {
            $pcspec = $this->service->getPcspecById($id);
            return $this->successResponse(
                (new PcspecResource($pcspec))->resolve(),
                'PC specification retrieved successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('PC specification not found');
        }
    }

    public function store(CreatePcspecRequest $request): JsonResponse
    {
        $pcspec = $this->service->createPcspec($request->validated());
        return $this->createdResponse(
            (new PcspecResource($pcspec))->resolve(),
            'PC specification created successfully'
        );
    }

    public function update(UpdatePcspecRequest $request, int $id): JsonResponse
    {
        try {
            $pcspec = $this->service->updatePcspec($id, $request->validated());
            return $this->successResponse(
                (new PcspecResource($pcspec))->resolve(),
                'PC specification updated successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('PC specification not found');
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->service->deletePcspec($id);
            return $this->deletedResponse('PC specification deleted successfully');
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('PC specification not found');
        }
    }

    public function restore(int $id): JsonResponse
    {
        try {
            $this->service->restorePcspec($id);
            return $this->successResponse(null, 'PC specification restored successfully');
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse('PC specification not found');
        }
    }

    public function active(): JsonResponse
    {
        $pcspecs = $this->service->getActivePcspecs();
        return $this->successResponse(
            PcspecResource::collection($pcspecs)->resolve(),
            'Active PC specifications retrieved successfully'
        );
    }
}
