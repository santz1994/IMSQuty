<?php

namespace App\Services;

use App\Models\Role;
use App\Models\Permission;
use App\Models\RoleHierarchy;
use App\Models\PermissionConflictRule;
use App\Models\PermissionTemplate;
use App\Models\BulkPermissionOperation;
use App\Exceptions\ValidationException;
use App\Exceptions\NotFoundException;
use App\Exceptions\ConflictException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

/**
 * Enhanced Permission Service
 * 
 * Handles advanced permission operations:
 * - Permission inheritance from parent roles
 * - Bulk permission assignment/revocation
 * - Permission templates
 * - Conflict detection
 * - Custom permission creation
 * 
 * @package App\Services
 * @author Daniel Rizaldy
 * @date 2026-01-14
 * @session 51
 * @requirement B.5 Enhanced Permissions
 */
class PermissionService
{
    /**
     * Get effective permissions for a role (including inherited)
     *
     * @param int $roleId
     * @param bool $includeInherited Default true
     * @return Collection
     */
    public function getEffectivePermissions(int $roleId, bool $includeInherited = true): Collection
    {
        // Try cache first
        $cacheKey = "role_permissions_{$roleId}_" . ($includeInherited ? 'with' : 'without') . '_inheritance';
        
        return Cache::remember($cacheKey, 3600, function () use ($roleId, $includeInherited) {
            // Get direct permissions
            $role = Role::with('permissions')->find($roleId);
            
            if (!$role) {
                throw new NotFoundException('Role not found');
            }
            
            $permissions = $role->permissions;
            
            if (!$includeInherited) {
                return $permissions;
            }
            
            // Get inherited permissions
            $inheritedPermissions = $this->getInheritedPermissions($roleId);
            
            // Merge and remove duplicates
            $allPermissions = $permissions->merge($inheritedPermissions)->unique('id');
            
            return $allPermissions;
        });
    }
    
    /**
     * Get permissions inherited from parent roles
     *
     * @param int $roleId
     * @param int $maxDepth Maximum inheritance depth (default 5 to prevent infinite loops)
     * @return Collection
     */
    protected function getInheritedPermissions(int $roleId, int $maxDepth = 5, int $currentDepth = 0): Collection
    {
        if ($currentDepth >= $maxDepth) {
            Log::warning("Permission inheritance max depth reached for role {$roleId}");
            return collect();
        }
        
        // Get parent roles
        $hierarchies = DB::table('role_hierarchy')
            ->where('child_role_id', $roleId)
            ->where('is_active', true)
            ->get();
        
        if ($hierarchies->isEmpty()) {
            return collect();
        }
        
        $inheritedPermissions = collect();
        
        foreach ($hierarchies as $hierarchy) {
            // Get parent role permissions
            $parentRole = Role::with('permissions')->find($hierarchy->parent_role_id);
            
            if (!$parentRole) {
                continue;
            }
            
            $parentPermissions = $parentRole->permissions;
            
            // Calculate how many permissions to inherit based on strength
            $inheritanceStrength = $hierarchy->inheritance_strength;
            $permissionsToInherit = $parentPermissions->count() * ($inheritanceStrength / 100);
            $permissionsToInherit = (int) ceil($permissionsToInherit);
            
            // Take the specified number of permissions (prioritize by risk level)
            $selectedPermissions = $parentPermissions
                ->sortBy(function ($permission) {
                    // Prioritize lower risk permissions for inheritance
                    $riskOrder = ['low' => 1, 'medium' => 2, 'high' => 3, 'critical' => 4];
                    return $riskOrder[$permission->risk_level] ?? 2;
                })
                ->take($permissionsToInherit);
            
            $inheritedPermissions = $inheritedPermissions->merge($selectedPermissions);
            
            // Recursively get permissions from grandparent roles
            $grandparentPermissions = $this->getInheritedPermissions(
                $hierarchy->parent_role_id,
                $maxDepth,
                $currentDepth + 1
            );
            
            $inheritedPermissions = $inheritedPermissions->merge($grandparentPermissions);
        }
        
        return $inheritedPermissions->unique('id');
    }
    
    /**
     * Assign multiple permissions to multiple roles (bulk operation)
     *
     * @param array $roleIds Array of role IDs
     * @param array $permissionIds Array of permission IDs
     * @param int $performedBy User ID performing the operation
     * @param bool $checkConflicts Whether to check for permission conflicts
     * @return array ['total' => int, 'successful' => int, 'failed' => int, 'errors' => array]
     * @throws ConflictException if conflicts found and checkConflicts is true
     */
    public function bulkAssignPermissions(
        array $roleIds,
        array $permissionIds,
        int $performedBy,
        bool $checkConflicts = true
    ): array {
        $results = [
            'total' => 0,
            'successful' => 0,
            'failed' => 0,
            'errors' => []
        ];
        
        DB::beginTransaction();
        
        try {
            // Check for conflicts if requested
            if ($checkConflicts) {
                $conflicts = $this->detectPermissionConflicts($permissionIds);
                
                if (!empty($conflicts)) {
                    throw new ConflictException(
                        'Permission conflicts detected',
                        ['conflicts' => $conflicts]
                    );
                }
            }
            
            foreach ($roleIds as $roleId) {
                foreach ($permissionIds as $permissionId) {
                    $results['total']++;
                    
                    try {
                        // Check if assignment already exists
                        $exists = DB::table('role_permission')
                            ->where('role_id', $roleId)
                            ->where('permission_id', $permissionId)
                            ->exists();
                        
                        if (!$exists) {
                            DB::table('role_permission')->insert([
                                'role_id' => $roleId,
                                'permission_id' => $permissionId,
                                'created_at' => now()
                            ]);
                        }
                        
                        $results['successful']++;
                    } catch (\Exception $e) {
                        $results['failed']++;
                        $results['errors'][] = [
                            'role_id' => $roleId,
                            'permission_id' => $permissionId,
                            'error' => $e->getMessage()
                        ];
                        
                        Log::error('Bulk permission assignment failed', [
                            'role_id' => $roleId,
                            'permission_id' => $permissionId,
                            'error' => $e->getMessage()
                        ]);
                    }
                }
            }
            
            // Log bulk operation
            BulkPermissionOperation::create([
                'operation_type' => 'assign',
                'performed_by' => $performedBy,
                'role_ids' => json_encode($roleIds),
                'permission_ids' => json_encode($permissionIds),
                'total_operations' => $results['total'],
                'successful_operations' => $results['successful'],
                'failed_operations' => $results['failed'],
                'errors' => !empty($results['errors']) ? json_encode($results['errors']) : null
            ]);
            
            // Clear cache for affected roles
            foreach ($roleIds as $roleId) {
                Cache::forget("role_permissions_{$roleId}_with_inheritance");
                Cache::forget("role_permissions_{$roleId}_without_inheritance");
            }
            
            DB::commit();
            
            return $results;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    /**
     * Revoke multiple permissions from multiple roles (bulk operation)
     *
     * @param array $roleIds Array of role IDs
     * @param array $permissionIds Array of permission IDs
     * @param int $performedBy User ID performing the operation
     * @return array ['total' => int, 'successful' => int, 'failed' => int, 'errors' => array]
     */
    public function bulkRevokePermissions(
        array $roleIds,
        array $permissionIds,
        int $performedBy
    ): array {
        $results = [
            'total' => 0,
            'successful' => 0,
            'failed' => 0,
            'errors' => []
        ];
        
        DB::beginTransaction();
        
        try {
            foreach ($roleIds as $roleId) {
                foreach ($permissionIds as $permissionId) {
                    $results['total']++;
                    
                    try {
                        $deleted = DB::table('role_permission')
                            ->where('role_id', $roleId)
                            ->where('permission_id', $permissionId)
                            ->delete();
                        
                        if ($deleted > 0) {
                            $results['successful']++;
                        }
                    } catch (\Exception $e) {
                        $results['failed']++;
                        $results['errors'][] = [
                            'role_id' => $roleId,
                            'permission_id' => $permissionId,
                            'error' => $e->getMessage()
                        ];
                    }
                }
            }
            
            // Log bulk operation
            BulkPermissionOperation::create([
                'operation_type' => 'revoke',
                'performed_by' => $performedBy,
                'role_ids' => json_encode($roleIds),
                'permission_ids' => json_encode($permissionIds),
                'total_operations' => $results['total'],
                'successful_operations' => $results['successful'],
                'failed_operations' => $results['failed'],
                'errors' => !empty($results['errors']) ? json_encode($results['errors']) : null
            ]);
            
            // Clear cache for affected roles
            foreach ($roleIds as $roleId) {
                Cache::forget("role_permissions_{$roleId}_with_inheritance");
                Cache::forget("role_permissions_{$roleId}_without_inheritance");
            }
            
            DB::commit();
            
            return $results;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    /**
     * Detect conflicts in a set of permissions
     *
     * @param array $permissionIds Array of permission IDs to check
     * @return array Array of conflicts found
     */
    public function detectPermissionConflicts(array $permissionIds): array
    {
        $conflicts = [];
        
        // Get all active conflict rules
        $rules = PermissionConflictRule::where('is_active', true)
            ->whereIn('permission_a_id', $permissionIds)
            ->whereIn('permission_b_id', $permissionIds)
            ->with(['permissionA', 'permissionB'])
            ->get();
        
        foreach ($rules as $rule) {
            // Check if both permissions in the conflict are in the provided set
            if (in_array($rule->permission_a_id, $permissionIds) && 
                in_array($rule->permission_b_id, $permissionIds)) {
                
                $conflicts[] = [
                    'permission_a' => $rule->permissionA->name,
                    'permission_b' => $rule->permissionB->name,
                    'type' => $rule->conflict_type,
                    'reason' => $rule->reason,
                    'severity' => $rule->severity
                ];
            }
        }
        
        return $conflicts;
    }
    
    /**
     * Apply a permission template to a role
     *
     * @param int $roleId
     * @param int $templateId
     * @param int $performedBy
     * @return array ['assigned' => int, 'skipped' => int]
     */
    public function applyTemplate(int $roleId, int $templateId, int $performedBy): array
    {
        $template = PermissionTemplate::where('is_active', true)->find($templateId);
        
        if (!$template) {
            throw new NotFoundException('Permission template not found');
        }
        
        $permissionIds = json_decode($template->permission_ids, true);
        
        // Use bulk assignment
        $results = $this->bulkAssignPermissions(
            [$roleId],
            $permissionIds,
            $performedBy,
            true // Check for conflicts
        );
        
        // Increment usage count
        $template->increment('usage_count');
        
        return [
            'assigned' => $results['successful'],
            'skipped' => $results['failed']
        ];
    }
    
    /**
     * Create a custom permission
     *
     * @param array $data
     * @return Permission
     * @throws ValidationException
     */
    public function createCustomPermission(array $data): Permission
    {
        // Validate required fields
        if (empty($data['name'])) {
            throw new ValidationException(['name' => 'Permission name is required']);
        }
        
        // Check if permission already exists
        if (Permission::where('name', $data['name'])->exists()) {
            throw new ValidationException(['name' => 'Permission already exists']);
        }
        
        // Create permission with custom flag
        $permission = Permission::create(array_merge($data, [
            'is_custom' => true,
            'is_system' => false,
            'risk_level' => $data['risk_level'] ?? 'medium',
            'category' => $data['category'] ?? null,
            'subcategory' => $data['subcategory'] ?? null
        ]));
        
        Log::info('Custom permission created', ['permission' => $permission->name]);
        
        return $permission;
    }
}
