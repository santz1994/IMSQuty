<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Role;
use Shared\Traits\ApiResponses;
use App\Http\Resources\RoleResource;

class RoleController extends Controller
{
    use ApiResponses;

    public function index(): JsonResponse
    {
        // Load roles with permissions and user counts
        $roles = Role::with('permissions')->withCount('users')->get();
        
        // Use Resource to ensure permissions are serialized
        return $this->successResponse(
            RoleResource::collection($roles),
            'Roles retrieved successfully'
        );
    }

    public function show(Role $role): JsonResponse
    {
        $role->load('permissions')->loadCount('users');
        return $this->successResponse($role, 'Role retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:roles,name',
            'display_name' => 'nullable|string',
            'description' => 'nullable|string',
            'permission_ids' => 'array',
            'permission_ids.*' => 'exists:permissions,id'
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'display_name' => $validated['display_name'] ?? $validated['name'],
            'description' => $validated['description'] ?? null,
            'guard_name' => 'api'
        ]);

        if (isset($validated['permission_ids'])) {
            $role->syncPermissions($validated['permission_ids']);
        }

        $role->load('permissions')->loadCount('users');
        return $this->successResponse($role, 'Role created successfully', 201);
    }

    public function update(Request $request, Role $role): JsonResponse
    {
        // Increase execution time for large permission updates
        set_time_limit(300);
        ini_set('max_execution_time', 300);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|unique:roles,name,' . $role->id,
            'display_name' => 'nullable|string',
            'description' => 'nullable|string',
            'permission_ids' => 'sometimes|array',
            'permission_ids.*' => 'exists:permissions,id'
        ]);

        try {
            \DB::beginTransaction();
            
            // Update basic fields
            $role->fill([
                'name' => $validated['name'] ?? $role->name,
                'display_name' => $validated['display_name'] ?? $role->display_name,
                'description' => $validated['description'] ?? $role->description,
            ]);
            $role->save();

            // Update permissions - optimized bulk insert
            if (isset($validated['permission_ids'])) {
                // Clear existing permissions in one query
                \DB::table('role_has_permissions')
                    ->where('role_id', $role->id)
                    ->delete();
                
                // Prepare bulk insert data
                $permissionData = array_map(function($permissionId) use ($role) {
                    return [
                        'role_id' => $role->id,
                        'permission_id' => $permissionId
                    ];
                }, $validated['permission_ids']);
                
                // Insert all at once (Laravel can handle this)
                if (!empty($permissionData)) {
                    \DB::table('role_has_permissions')->insert($permissionData);
                }
                
                // Clear permission cache
                app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
            }

            \DB::commit();

            // Return response immediately, load relations after
            $role->load('permissions')->loadCount('users');
            return $this->successResponse($role, 'Role updated successfully');
            
        } catch (\Exception $e) {
            \DB::rollBack();
            \Log::error('Role update error: ' . $e->getMessage(), [
                'role_id' => $role->id,
                'trace' => $e->getTraceAsString()
            ]);
            return $this->errorResponse('Failed to update role: ' . $e->getMessage(), 500);
        }
    }

    public function destroy(Role $role): JsonResponse
    {
        if ($role->is_system) {
            return $this->errorResponse('Cannot delete system role', 403);
        }

        $role->delete();
        return $this->successResponse(null, 'Role deleted successfully');
    }
}
