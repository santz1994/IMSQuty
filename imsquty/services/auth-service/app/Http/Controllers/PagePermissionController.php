<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

/**
 * Page Permission Controller
 * 
 * Manages which pages/routes each role can access
 */
class PagePermissionController extends Controller
{
    /**
     * Get all pages
     */
    public function getAllPages(): JsonResponse
    {
        $pages = DB::table('pages')
            ->where('is_active', true)
            ->orderBy('module')
            ->orderBy('sort_order')
            ->get();

        $groupedPages = $pages->groupBy('module');

        return response()->json([
            'success' => true,
            'data' => [
                'pages' => $pages,
                'grouped' => $groupedPages,
            ],
            'message' => 'Pages retrieved successfully'
        ]);
    }

    /**
     * Get pages for a specific role
     */
    public function getRolePages(int $roleId): JsonResponse
    {
        $pages = DB::table('pages as p')
            ->leftJoin('role_page_permissions as rpp', function($join) use ($roleId) {
                $join->on('p.id', '=', 'rpp.page_id')
                     ->where('rpp.role_id', '=', $roleId);
            })
            ->where('p.is_active', true)
            ->select(
                'p.*',
                'rpp.can_access',
                'rpp.id as permission_id'
            )
            ->orderBy('p.module')
            ->orderBy('p.sort_order')
            ->get();

        $groupedPages = $pages->groupBy('module');

        return response()->json([
            'success' => true,
            'data' => [
                'role_id' => $roleId,
                'pages' => $pages,
                'grouped' => $groupedPages,
            ],
            'message' => 'Role pages retrieved successfully'
        ]);
    }

    /**
     * Assign page access to role
     */
    public function assignPageToRole(Request $request, int $roleId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'page_id' => 'required|integer|exists:pages,id',
            'can_access' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $pageId = $request->input('page_id');
        $canAccess = $request->input('can_access', true);

        // Check if permission already exists
        $existing = DB::table('role_page_permissions')
            ->where('role_id', $roleId)
            ->where('page_id', $pageId)
            ->first();

        if ($existing) {
            // Update existing
            DB::table('role_page_permissions')
                ->where('id', $existing->id)
                ->update([
                    'can_access' => $canAccess,
                    'updated_at' => now(),
                ]);
        } else {
            // Create new
            DB::table('role_page_permissions')->insert([
                'role_id' => $roleId,
                'page_id' => $pageId,
                'can_access' => $canAccess,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Page permission updated successfully',
        ]);
    }

    /**
     * Bulk sync page permissions for role
     */
    public function syncRolePages(Request $request, int $roleId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'page_ids' => 'required|array',
            'page_ids.*' => 'integer|exists:pages,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $pageIds = $request->input('page_ids');

        DB::beginTransaction();
        try {
            // Remove all existing permissions for this role
            DB::table('role_page_permissions')
                ->where('role_id', $roleId)
                ->delete();

            // Insert new permissions
            $insertData = [];
            foreach ($pageIds as $pageId) {
                $insertData[] = [
                    'role_id' => $roleId,
                    'page_id' => $pageId,
                    'can_access' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            if (!empty($insertData)) {
                DB::table('role_page_permissions')->insert($insertData);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Role pages synced successfully',
                'data' => [
                    'role_id' => $roleId,
                    'page_count' => count($pageIds),
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to sync role pages',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove page access from role
     */
    public function removePageFromRole(int $roleId, int $pageId): JsonResponse
    {
        $deleted = DB::table('role_page_permissions')
            ->where('role_id', $roleId)
            ->where('page_id', $pageId)
            ->delete();

        if ($deleted) {
            return response()->json([
                'success' => true,
                'message' => 'Page permission removed successfully',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Page permission not found',
        ], 404);
    }

    /**
     * Get accessible pages for current user (based on roles)
     */
    public function getMyAccessiblePages(Request $request): JsonResponse
    {
        $userId = $request->user()->id ?? null;

        if (!$userId) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated',
            ], 401);
        }

        // Get user's roles
        $userRoles = DB::table('model_has_roles')
            ->where('model_type', 'App\\Models\\User')
            ->where('model_id', $userId)
            ->pluck('role_id');

        if ($userRoles->isEmpty()) {
            return response()->json([
                'success' => true,
                'data' => [
                    'pages' => [],
                    'grouped' => [],
                ],
                'message' => 'No roles assigned to user',
            ]);
        }

        // Get accessible pages
        $pages = DB::table('pages as p')
            ->join('role_page_permissions as rpp', 'p.id', '=', 'rpp.page_id')
            ->whereIn('rpp.role_id', $userRoles)
            ->where('rpp.can_access', true)
            ->where('p.is_active', true)
            ->select('p.*')
            ->distinct()
            ->orderBy('p.module')
            ->orderBy('p.sort_order')
            ->get();

        $groupedPages = $pages->groupBy('module');

        return response()->json([
            'success' => true,
            'data' => [
                'pages' => $pages,
                'grouped' => $groupedPages,
            ],
            'message' => 'Accessible pages retrieved successfully'
        ]);
    }
}
