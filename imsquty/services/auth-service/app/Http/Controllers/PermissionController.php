<?php

namespace App\Http\Controllers;

use App\Services\RBACService;
use App\Services\PermissionService;
use App\Exceptions\NotFoundException;
use App\Exceptions\ValidationException;
use App\Exceptions\ConflictException;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

/**
 * Permission Controller
 * 
 * Handles HTTP requests for permission management including:
 * - Basic CRUD operations
 * - Enhanced features (B.5): inheritance, bulk ops, templates, conflicts
 * 
 * @package App\Http\Controllers
 */
class PermissionController extends Controller
{
    /**
     * @param RBACService $rbacService
     * @param PermissionService $permissionService
     */
    public function __construct(
        private RBACService $rbacService,
        private PermissionService $permissionService
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
    
    // ==================== ENHANCED PERMISSION FEATURES (B.5) ====================
    
    /**
     * Get effective permissions for a role (including inherited)
     * 
     * GET /api/v1/permissions/effective/{roleId}?includeInherited=true
     */
    public function getEffectivePermissions(Request $request, int $roleId): JsonResponse
    {
        try {
            $includeInherited = $request->query('includeInherited', 'true') === 'true';
            
            $permissions = $this->permissionService->getEffectivePermissions(
                $roleId,
                $includeInherited
            );
            
            return response()->json([
                'success' => true,
                'data' => [
                    'role_id' => $roleId,
                    'include_inherited' => $includeInherited,
                    'permissions' => $permissions->map(function ($permission) {
                        return [
                            'id' => $permission->id,
                            'name' => $permission->name,
                            'description' => $permission->description,
                            'resource' => $permission->resource,
                            'action' => $permission->action,
                            'category' => $permission->category ?? 'uncategorized',
                            'risk_level' => $permission->risk_level ?? 'medium',
                            'is_custom' => $permission->is_custom ?? false
                        ];
                    })->values(),
                    'total_count' => $permissions->count()
                ]
            ]);
        } catch (NotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        } catch (\Exception $e) {
            Log::error('Error fetching effective permissions', [
                'role_id' => $roleId,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch effective permissions'
            ], 500);
        }
    }
    
    /**
     * Bulk assign permissions to multiple roles
     * 
     * POST /api/v1/permissions/bulk-assign
     */
    public function bulkAssignPermissions(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'role_ids' => 'required|array|min:1',
                'role_ids.*' => 'required|integer|exists:roles,id',
                'permission_ids' => 'required|array|min:1',
                'permission_ids.*' => 'required|integer|exists:permissions,id',
                'check_conflicts' => 'boolean'
            ]);
            
            $performedBy = $request->user()->id;
            $checkConflicts = $validated['check_conflicts'] ?? true;
            
            $results = $this->permissionService->bulkAssignPermissions(
                $validated['role_ids'],
                $validated['permission_ids'],
                $performedBy,
                $checkConflicts
            );
            
            return response()->json([
                'success' => true,
                'message' => 'Bulk permission assignment completed',
                'data' => $results
            ]);
        } catch (ConflictException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'data' => $e->getData()
            ], 409);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->getErrors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Bulk permission assignment failed', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Bulk assignment failed'
            ], 500);
        }
    }
    
    /**
     * Bulk revoke permissions from multiple roles
     * 
     * POST /api/v1/permissions/bulk-revoke
     */
    public function bulkRevokePermissions(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'role_ids' => 'required|array|min:1',
                'role_ids.*' => 'required|integer|exists:roles,id',
                'permission_ids' => 'required|array|min:1',
                'permission_ids.*' => 'required|integer|exists:permissions,id'
            ]);
            
            $performedBy = $request->user()->id;
            
            $results = $this->permissionService->bulkRevokePermissions(
                $validated['role_ids'],
                $validated['permission_ids'],
                $performedBy
            );
            
            return response()->json([
                'success' => true,
                'message' => 'Bulk permission revocation completed',
                'data' => $results
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->getErrors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Bulk permission revocation failed', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Bulk revocation failed'
            ], 500);
        }
    }
    
    /**
     * Detect conflicts in a set of permissions
     * 
     * POST /api/v1/permissions/detect-conflicts
     */
    public function detectConflicts(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'permission_ids' => 'required|array|min:1',
                'permission_ids.*' => 'required|integer|exists:permissions,id'
            ]);
            
            $conflicts = $this->permissionService->detectPermissionConflicts(
                $validated['permission_ids']
            );
            
            return response()->json([
                'success' => true,
                'data' => [
                    'has_conflicts' => !empty($conflicts),
                    'conflicts' => $conflicts,
                    'conflict_count' => count($conflicts)
                ]
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->getErrors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Conflict detection failed', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Conflict detection failed'
            ], 500);
        }
    }
    
    /**
     * Apply a permission template to a role
     * 
     * POST /api/v1/permissions/templates/{templateId}/apply
     */
    public function applyTemplate(Request $request, int $templateId): JsonResponse
    {
        try {
            $validated = $request->validate([
                'role_id' => 'required|integer|exists:roles,id'
            ]);
            
            $performedBy = $request->user()->id;
            
            $results = $this->permissionService->applyTemplate(
                $validated['role_id'],
                $templateId,
                $performedBy
            );
            
            return response()->json([
                'success' => true,
                'message' => 'Template applied successfully',
                'data' => $results
            ]);
        } catch (NotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        } catch (ConflictException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'data' => $e->getData()
            ], 409);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->getErrors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Template application failed', [
                'template_id' => $templateId,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Template application failed'
            ], 500);
        }
    }
    
    /**
     * Create a custom permission
     * 
     * POST /api/v1/permissions/custom
     */
    public function createCustomPermission(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:100|unique:permissions,name',
                'description' => 'nullable|string',
                'resource' => 'required|string|max:50',
                'action' => 'required|string|max:50',
                'category' => 'nullable|string|max:50',
                'subcategory' => 'nullable|string|max:50',
                'risk_level' => 'nullable|in:low,medium,high,critical'
            ]);
            
            $permission = $this->permissionService->createCustomPermission($validated);
            
            return response()->json([
                'success' => true,
                'message' => 'Custom permission created successfully',
                'data' => [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'description' => $permission->description,
                    'resource' => $permission->resource,
                    'action' => $permission->action,
                    'category' => $permission->category,
                    'risk_level' => $permission->risk_level,
                    'is_custom' => true
                ]
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->getErrors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Custom permission creation failed', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Custom permission creation failed'
            ], 500);
        }
    }
}
