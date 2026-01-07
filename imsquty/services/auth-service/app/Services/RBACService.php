<?php

namespace App\Services;

use App\Models\Role;
use App\Models\Permission;
use App\Models\User;
use App\Exceptions\ValidationException;
use App\Exceptions\NotFoundException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * RBAC Service
 * 
 * Handles Role-Based Access Control operations:
 * - Role management (CRUD)
 * - Permission management (CRUD)
 * - Role-Permission assignments
 * - User-Role assignments
 * - User-Permission assignments
 * - Permission checking
 * 
 * @package App\Services
 */
class RBACService
{
    /**
     * Get all roles with optional filters
     *
     * @param array $filters ['is_system' => bool, 'with_permissions' => bool, 'with_users' => bool]
     * @return Collection
     */
    public function getRoles(array $filters = []): Collection
    {
        $query = Role::query();

        if (isset($filters['is_system'])) {
            $query->where('is_system', $filters['is_system']);
        }

        if ($filters['with_permissions'] ?? false) {
            $query->with('permissions');
        }

        if ($filters['with_users'] ?? false) {
            $query->with('users');
        }

        return $query->orderBy('name')->get();
    }

    /**
     * Get role by ID
     *
     * @param int $roleId
     * @param bool $withRelations
     * @return Role
     * @throws NotFoundException
     */
    public function getRoleById(int $roleId, bool $withRelations = false): Role
    {
        $query = Role::query();

        if ($withRelations) {
            $query->with(['permissions', 'users']);
        }

        $role = $query->find($roleId);

        if (!$role) {
            throw new NotFoundException('Role not found');
        }

        return $role;
    }

    /**
     * Create new role
     *
     * @param array $data ['name', 'description', 'guard_name', 'is_system']
     * @return Role
     * @throws ValidationException
     */
    public function createRole(array $data): Role
    {
        // Validate required fields
        if (empty($data['name'])) {
            throw new ValidationException(['name' => 'Role name is required']);
        }

        // Check if role name already exists
        if (Role::where('name', $data['name'])->exists()) {
            throw new ValidationException(['name' => 'Role name already exists']);
        }

        DB::beginTransaction();
        try {
            $role = Role::create([
                'name' => $data['name'],
                'guard_name' => $data['guard_name'] ?? 'web',
                'description' => $data['description'] ?? null,
                'is_system' => $data['is_system'] ?? false,
            ]);

            // Assign permissions if provided
            if (!empty($data['permissions']) && is_array($data['permissions'])) {
                $this->syncRolePermissions($role->id, $data['permissions']);
            }

            DB::commit();

            Log::info('Role created', [
                'role_id' => $role->id,
                'role_name' => $role->name,
            ]);

            return $role->load('permissions');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create role', [
                'error' => $e->getMessage(),
                'data' => $data,
            ]);
            throw $e;
        }
    }

    /**
     * Update existing role
     *
     * @param int $roleId
     * @param array $data ['name', 'description']
     * @return Role
     * @throws NotFoundException
     * @throws ValidationException
     */
    public function updateRole(int $roleId, array $data): Role
    {
        $role = $this->getRoleById($roleId);

        // Prevent updating system roles
        if ($role->is_system) {
            throw new ValidationException(['role' => 'Cannot update system role']);
        }

        // Check if name is being changed and already exists
        if (isset($data['name']) && $data['name'] !== $role->name) {
            if (Role::where('name', $data['name'])->exists()) {
                throw new ValidationException(['name' => 'Role name already exists']);
            }
        }

        DB::beginTransaction();
        try {
            $role->update([
                'name' => $data['name'] ?? $role->name,
                'description' => $data['description'] ?? $role->description,
            ]);

            // Update permissions if provided
            if (isset($data['permissions']) && is_array($data['permissions'])) {
                $this->syncRolePermissions($role->id, $data['permissions']);
            }

            DB::commit();

            Log::info('Role updated', [
                'role_id' => $role->id,
                'role_name' => $role->name,
            ]);

            return $role->load('permissions');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update role', [
                'role_id' => $roleId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Delete role
     *
     * @param int $roleId
     * @return void
     * @throws NotFoundException
     * @throws ValidationException
     */
    public function deleteRole(int $roleId): void
    {
        $role = $this->getRoleById($roleId, true);

        // Prevent deleting system roles
        if ($role->is_system) {
            throw new ValidationException(['role' => 'Cannot delete system role']);
        }

        // Check if role is assigned to users
        if ($role->users()->exists()) {
            throw new ValidationException(['role' => 'Cannot delete role that is assigned to users']);
        }

        DB::beginTransaction();
        try {
            // Remove all permission assignments
            $role->permissions()->detach();

            // Delete role
            $role->delete();

            DB::commit();

            Log::info('Role deleted', [
                'role_id' => $roleId,
                'role_name' => $role->name,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to delete role', [
                'role_id' => $roleId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Get all permissions grouped by category
     *
     * @return Collection
     */
    public function getPermissions(): Collection
    {
        return Permission::with('roles')->orderBy('group')->orderBy('name')->get()->groupBy('group');
    }

    /**
     * Get permission by ID
     *
     * @param int $permissionId
     * @return Permission
     * @throws NotFoundException
     */
    public function getPermissionById(int $permissionId): Permission
    {
        $permission = Permission::with('roles')->find($permissionId);

        if (!$permission) {
            throw new NotFoundException('Permission not found');
        }

        return $permission;
    }

    /**
     * Sync permissions for role
     *
     * @param int $roleId
     * @param array $permissionIds Array of permission IDs or names
     * @return void
     * @throws NotFoundException
     */
    public function syncRolePermissions(int $roleId, array $permissionIds): void
    {
        $role = $this->getRoleById($roleId);

        $permissions = [];
        foreach ($permissionIds as $permission) {
            if (is_numeric($permission)) {
                $permissions[] = $permission;
            } elseif (is_string($permission)) {
                $perm = Permission::where('name', $permission)->first();
                if ($perm) {
                    $permissions[] = $perm->id;
                }
            }
        }

        $role->permissions()->sync($permissions);

        Log::info('Role permissions synced', [
            'role_id' => $roleId,
            'permissions_count' => count($permissions),
        ]);
    }

    /**
     * Assign role to user
     *
     * @param int $userId
     * @param string|int $role Role name or ID
     * @return void
     * @throws NotFoundException
     */
    public function assignRoleToUser(int $userId, $role): void
    {
        $user = User::find($userId);

        if (!$user) {
            throw new NotFoundException('User not found');
        }

        if (is_numeric($role)) {
            $roleModel = Role::find($role);
        } else {
            $roleModel = Role::where('name', $role)->first();
        }

        if (!$roleModel) {
            throw new NotFoundException('Role not found');
        }

        $user->assignRole($roleModel);

        Log::info('Role assigned to user', [
            'user_id' => $userId,
            'role_id' => $roleModel->id,
            'role_name' => $roleModel->name,
        ]);
    }

    /**
     * Remove role from user
     *
     * @param int $userId
     * @param string|int $role Role name or ID
     * @return void
     * @throws NotFoundException
     */
    public function removeRoleFromUser(int $userId, $role): void
    {
        $user = User::find($userId);

        if (!$user) {
            throw new NotFoundException('User not found');
        }

        if (is_numeric($role)) {
            $roleModel = Role::find($role);
        } else {
            $roleModel = Role::where('name', $role)->first();
        }

        if (!$roleModel) {
            throw new NotFoundException('Role not found');
        }

        $user->removeRole($roleModel);

        Log::info('Role removed from user', [
            'user_id' => $userId,
            'role_id' => $roleModel->id,
            'role_name' => $roleModel->name,
        ]);
    }

    /**
     * Sync roles for user (replace all existing)
     *
     * @param int $userId
     * @param array $roles Array of role names or IDs
     * @return void
     * @throws NotFoundException
     */
    public function syncUserRoles(int $userId, array $roles): void
    {
        $user = User::find($userId);

        if (!$user) {
            throw new NotFoundException('User not found');
        }

        $user->syncRoles($roles);

        Log::info('User roles synced', [
            'user_id' => $userId,
            'roles_count' => count($roles),
        ]);
    }

    /**
     * Give permission directly to user
     *
     * @param int $userId
     * @param string|int $permission Permission name or ID
     * @return void
     * @throws NotFoundException
     */
    public function givePermissionToUser(int $userId, $permission): void
    {
        $user = User::find($userId);

        if (!$user) {
            throw new NotFoundException('User not found');
        }

        if (is_numeric($permission)) {
            $permModel = Permission::find($permission);
        } else {
            $permModel = Permission::where('name', $permission)->first();
        }

        if (!$permModel) {
            throw new NotFoundException('Permission not found');
        }

        $user->givePermissionTo($permModel);

        Log::info('Permission given to user', [
            'user_id' => $userId,
            'permission_id' => $permModel->id,
            'permission_name' => $permModel->name,
        ]);
    }

    /**
     * Revoke direct permission from user
     *
     * @param int $userId
     * @param string|int $permission Permission name or ID
     * @return void
     * @throws NotFoundException
     */
    public function revokePermissionFromUser(int $userId, $permission): void
    {
        $user = User::find($userId);

        if (!$user) {
            throw new NotFoundException('User not found');
        }

        if (is_numeric($permission)) {
            $permModel = Permission::find($permission);
        } else {
            $permModel = Permission::where('name', $permission)->first();
        }

        if (!$permModel) {
            throw new NotFoundException('Permission not found');
        }

        $user->revokePermissionTo($permModel);

        Log::info('Permission revoked from user', [
            'user_id' => $userId,
            'permission_id' => $permModel->id,
            'permission_name' => $permModel->name,
        ]);
    }

    /**
     * Get all permissions for user (direct + via roles)
     *
     * @param int $userId
     * @return Collection
     * @throws NotFoundException
     */
    public function getUserPermissions(int $userId): Collection
    {
        $user = User::with(['permissions', 'roles.permissions'])->find($userId);

        if (!$user) {
            throw new NotFoundException('User not found');
        }

        return $user->getAllPermissions();
    }

    /**
     * Get all roles for user
     *
     * @param int $userId
     * @return Collection
     * @throws NotFoundException
     */
    public function getUserRoles(int $userId): Collection
    {
        $user = User::with('roles.permissions')->find($userId);

        if (!$user) {
            throw new NotFoundException('User not found');
        }

        return $user->roles;
    }

    /**
     * Check if user has permission
     *
     * @param int $userId
     * @param string $permission
     * @return bool
     */
    public function userHasPermission(int $userId, string $permission): bool
    {
        $user = User::with(['permissions', 'roles.permissions'])->find($userId);

        if (!$user) {
            return false;
        }

        return $user->hasPermission($permission);
    }

    /**
     * Check if user has role
     *
     * @param int $userId
     * @param string $role
     * @return bool
     */
    public function userHasRole(int $userId, string $role): bool
    {
        $user = User::with('roles')->find($userId);

        if (!$user) {
            return false;
        }

        return $user->hasRole($role);
    }
}
