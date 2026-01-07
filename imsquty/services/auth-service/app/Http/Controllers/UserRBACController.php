<?php

namespace App\Http\Controllers;

use App\Services\RBACService;
use App\Exceptions\NotFoundException;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

/**
 * User RBAC Controller
 * 
 * Handles HTTP requests for user role and permission management
 * 
 * @package App\Http\Controllers
 */
class UserRBACController extends Controller
{
    /**
     * @param RBACService $rbacService
     */
    public function __construct(
        private RBACService $rbacService
    ) {}

    /**
     * Get user roles
     * 
     * GET /api/v1/users/{userId}/roles
     *
     * @param int $userId
     * @return JsonResponse
     */
    public function getUserRoles(int $userId): JsonResponse
    {
        try {
            $roles = $this->rbacService->getUserRoles($userId);

            return response()->json([
                'success' => true,
                'data' => $roles,
                'meta' => [
                    'total' => $roles->count(),
                ],
            ]);

        } catch (NotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Get user permissions (all: direct + via roles)
     * 
     * GET /api/v1/users/{userId}/permissions
     *
     * @param int $userId
     * @return JsonResponse
     */
    public function getUserPermissions(int $userId): JsonResponse
    {
        try {
            $permissions = $this->rbacService->getUserPermissions($userId);

            return response()->json([
                'success' => true,
                'data' => $permissions,
                'meta' => [
                    'total' => $permissions->count(),
                ],
            ]);

        } catch (NotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Assign role to user
     * 
     * POST /api/v1/users/{userId}/roles
     * Body: {role: "Admin"} or {role: 1}
     *
     * @param Request $request
     * @param int $userId
     * @return JsonResponse
     */
    public function assignRole(Request $request, int $userId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'role' => 'required|string|exists:roles,name',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $this->rbacService->assignRoleToUser($userId, $request->input('role'));

            $roles = $this->rbacService->getUserRoles($userId);

            return response()->json([
                'success' => true,
                'message' => 'Role assigned successfully',
                'data' => $roles,
            ]);

        } catch (NotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Remove role from user
     * 
     * DELETE /api/v1/users/{userId}/roles/{role}
     *
     * @param int $userId
     * @param string $role Role name
     * @return JsonResponse
     */
    public function removeRole(int $userId, string $role): JsonResponse
    {
        try {
            $this->rbacService->removeRoleFromUser($userId, $role);

            $roles = $this->rbacService->getUserRoles($userId);

            return response()->json([
                'success' => true,
                'message' => 'Role removed successfully',
                'data' => $roles,
            ]);

        } catch (NotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Sync roles for user (replace all)
     * 
     * PUT /api/v1/users/{userId}/roles
     * Body: {roles: ["Admin", "Manager"]}
     *
     * @param Request $request
     * @param int $userId
     * @return JsonResponse
     */
    public function syncRoles(Request $request, int $userId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'roles' => 'required|array',
            'roles.*' => 'exists:roles,name',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $this->rbacService->syncUserRoles($userId, $request->input('roles'));

            $roles = $this->rbacService->getUserRoles($userId);

            return response()->json([
                'success' => true,
                'message' => 'User roles updated successfully',
                'data' => $roles,
            ]);

        } catch (NotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Give permission directly to user
     * 
     * POST /api/v1/users/{userId}/permissions
     * Body: {permission: "assets.delete"}
     *
     * @param Request $request
     * @param int $userId
     * @return JsonResponse
     */
    public function givePermission(Request $request, int $userId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'permission' => 'required|string|exists:permissions,name',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $this->rbacService->givePermissionToUser($userId, $request->input('permission'));

            $permissions = $this->rbacService->getUserPermissions($userId);

            return response()->json([
                'success' => true,
                'message' => 'Permission granted successfully',
                'data' => $permissions,
            ]);

        } catch (NotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Revoke permission from user
     * 
     * DELETE /api/v1/users/{userId}/permissions/{permission}
     *
     * @param int $userId
     * @param string $permission Permission name
     * @return JsonResponse
     */
    public function revokePermission(int $userId, string $permission): JsonResponse
    {
        try {
            $this->rbacService->revokePermissionFromUser($userId, $permission);

            $permissions = $this->rbacService->getUserPermissions($userId);

            return response()->json([
                'success' => true,
                'message' => 'Permission revoked successfully',
                'data' => $permissions,
            ]);

        } catch (NotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Check if user has permission
     * 
     * GET /api/v1/users/{userId}/check-permission/{permission}
     *
     * @param int $userId
     * @param string $permission
     * @return JsonResponse
     */
    public function checkPermission(int $userId, string $permission): JsonResponse
    {
        $hasPermission = $this->rbacService->userHasPermission($userId, $permission);

        return response()->json([
            'success' => true,
            'has_permission' => $hasPermission,
            'permission' => $permission,
        ]);
    }

    /**
     * Check if user has role
     * 
     * GET /api/v1/users/{userId}/check-role/{role}
     *
     * @param int $userId
     * @param string $role
     * @return JsonResponse
     */
    public function checkRole(int $userId, string $role): JsonResponse
    {
        $hasRole = $this->rbacService->userHasRole($userId, $role);

        return response()->json([
            'success' => true,
            'has_role' => $hasRole,
            'role' => $role,
        ]);
    }
}
