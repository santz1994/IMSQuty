<?php

namespace App\Http\Controllers;

use App\Services\RBACService;
use App\Exceptions\ValidationException;
use App\Exceptions\NotFoundException;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

/**
 * Role Controller
 * 
 * Handles HTTP requests for role management
 * 
 * @package App\Http\Controllers
 */
class RoleController extends Controller
{
    /**
     * @param RBACService $rbacService
     */
    public function __construct(
        private RBACService $rbacService
    ) {}

    /**
     * Get all roles
     * 
     * GET /api/v1/roles
     * Query params: is_system (bool), with_permissions (bool), with_users (bool)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $filters = [
            'is_system' => $request->query('is_system') !== null 
                ? filter_var($request->query('is_system'), FILTER_VALIDATE_BOOLEAN) 
                : null,
            'with_permissions' => filter_var($request->query('with_permissions'), FILTER_VALIDATE_BOOLEAN),
            'with_users' => filter_var($request->query('with_users'), FILTER_VALIDATE_BOOLEAN),
        ];

        // Remove null values
        $filters = array_filter($filters, fn($value) => $value !== null);

        $roles = $this->rbacService->getRoles($filters);

        return response()->json([
            'success' => true,
            'data' => $roles,
            'meta' => [
                'total' => $roles->count(),
            ],
        ]);
    }

    /**
     * Get role by ID
     * 
     * GET /api/v1/roles/{id}
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $role = $this->rbacService->getRoleById($id, true);

            return response()->json([
                'success' => true,
                'data' => $role,
            ]);

        } catch (NotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Create new role
     * 
     * POST /api/v1/roles
     * Body: {name, display_name?, description?, guard_name?, is_system?, permissions?, permission_ids?}
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:roles,name',
            'display_name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'guard_name' => 'nullable|string|max:255',
            'is_system' => 'nullable|boolean',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
            'permission_ids' => 'nullable|array',
            'permission_ids.*' => 'exists:permissions,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $role = $this->rbacService->createRole($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Role created successfully',
                'data' => $role,
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->getErrors(),
            ], 422);
        }
    }

    /**
     * Update role
     * 
     * PUT /api/v1/roles/{id}
     * Body: {name?, display_name?, description?, permissions?, permission_ids?}
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'display_name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:500',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
            'permission_ids' => 'nullable|array',
            'permission_ids.*' => 'exists:permissions,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $role = $this->rbacService->updateRole($id, $request->all());

            return response()->json([
                'success' => true,
                'message' => 'Role updated successfully',
                'data' => $role,
            ]);

        } catch (NotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->getErrors(),
            ], 422);
        }
    }

    /**
     * Delete role
     * 
     * DELETE /api/v1/roles/{id}
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->rbacService->deleteRole($id);

            return response()->json([
                'success' => true,
                'message' => 'Role deleted successfully',
            ]);

        } catch (NotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'errors' => $e->getErrors(),
            ], 422);
        }
    }

    /**
     * Sync permissions for role
     * 
     * POST /api/v1/roles/{id}/permissions/sync
     * Body: {permissions: [1, 2, 3]} or {permission_ids: [1, 2, 3]}
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function syncPermissions(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'permissions' => 'sometimes|required|array',
            'permissions.*' => 'exists:permissions,id',
            'permission_ids' => 'sometimes|required|array',
            'permission_ids.*' => 'exists:permissions,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Support both 'permissions' and 'permission_ids' fields
            $permissionIds = $request->input('permissions') ?? $request->input('permission_ids') ?? [];
            
            $this->rbacService->syncRolePermissions($id, $permissionIds);

            $role = $this->rbacService->getRoleById($id, true);

            return response()->json([
                'success' => true,
                'message' => 'Role permissions updated successfully',
                'data' => $role,
            ]);

        } catch (NotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }
}
