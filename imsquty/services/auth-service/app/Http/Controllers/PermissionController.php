<?php

namespace App\Http\Controllers;

use App\Services\RBACService;
use App\Exceptions\NotFoundException;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * Permission Controller
 * 
 * Handles HTTP requests for permission management
 * 
 * @package App\Http\Controllers
 */
class PermissionController extends Controller
{
    /**
     * @param RBACService $rbacService
     */
    public function __construct(
        private RBACService $rbacService
    ) {}

    /**
     * Get all permissions grouped by category
     * 
     * GET /api/v1/permissions
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $permissions = $this->rbacService->getPermissions();

        return response()->json([
            'success' => true,
            'data' => $permissions,
            'meta' => [
                'groups' => $permissions->keys(),
                'total' => $permissions->flatten(1)->count(),
            ],
        ]);
    }

    /**
     * Get permission by ID
     * 
     * GET /api/v1/permissions/{id}
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $permission = $this->rbacService->getPermissionById($id);

            return response()->json([
                'success' => true,
                'data' => $permission,
            ]);

        } catch (NotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }
}
