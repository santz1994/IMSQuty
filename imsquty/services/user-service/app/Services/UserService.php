<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

/**
 * User Service
 * 
 * Business logic for user management
 */
class UserService
{
    public function __construct(
        private UserRepository $repository
    ) {}

    /**
     * Get all users with filters and pagination
     * 
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAllUsers(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->getAllWithFilters($filters, $perPage);
    }

    /**
     * Get user by ID with relationships
     * 
     * @param int $id
     * @return User|null
     */
    public function getUserById(int $id): ?User
    {
        return $this->repository->findWithRelations($id);
    }

    /**
     * Create new user
     * 
     * @param array $data
     * @return User
     */
    public function createUser(array $data): User
    {
        DB::beginTransaction();
        
        try {
            // Hash password
            if (isset($data['password'])) {
                $data['password'] = Hash::make($data['password']);
            }
            
            // Set default values
            $data['status'] = $data['status'] ?? 'active';
            $data['email_verified_at'] = now();
            
            // Create user
            $user = $this->repository->create($data);
            
            // Assign role
            if (isset($data['role'])) {
                $user->assignRole($data['role']);
            } else {
                // Assign default 'User' role
                $user->assignRole('User');
            }
            
            // Create audit log
            $this->repository->createAuditLog([
                'user_id' => auth()->id(),
                'action' => 'created',
                'auditable_type' => User::class,
                'auditable_id' => $user->id,
                'old_values' => null,
                'new_values' => json_encode($user->only(['id', 'username', 'email', 'first_name', 'last_name', 'status'])),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
            
            DB::commit();
            
            return $user->fresh(['roles', 'permissions']);
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update user
     * 
     * @param int $id
     * @param array $data
     * @return User|null
     */
    public function updateUser(int $id, array $data): ?User
    {
        $user = $this->repository->find($id);
        
        if (!$user) {
            return null;
        }
        
        DB::beginTransaction();
        
        try {
            $oldValues = $user->toArray();
            
            // Hash password if provided
            if (isset($data['password'])) {
                $data['password'] = Hash::make($data['password']);
            }
            
            // Update user
            $user = $this->repository->update($id, $data);
            
            // Update role if provided
            if (isset($data['role'])) {
                $user->syncRoles([$data['role']]);
            }
            
            // Create audit log
            $this->repository->createAuditLog([
                'user_id' => auth()->id(),
                'action' => 'updated',
                'auditable_type' => User::class,
                'auditable_id' => $user->id,
                'old_values' => json_encode($oldValues),
                'new_values' => json_encode($user->fresh()->toArray()),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
            
            DB::commit();
            
            return $user->fresh(['roles', 'permissions']);
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Delete user (soft delete)
     * 
     * @param int $id
     * @return bool
     */
    public function deleteUser(int $id): bool
    {
        $user = $this->repository->find($id);
        
        if (!$user) {
            return false;
        }
        
        DB::beginTransaction();
        
        try {
            // Create audit log before deletion
            $this->repository->createAuditLog([
                'user_id' => auth()->id(),
                'action' => 'deleted',
                'auditable_type' => User::class,
                'auditable_id' => $user->id,
                'old_values' => json_encode($user->toArray()),
                'new_values' => null,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
            
            $result = $this->repository->delete($id);
            
            DB::commit();
            
            return $result;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Restore soft-deleted user
     * 
     * @param int $id
     * @return User|null
     */
    public function restoreUser(int $id): ?User
    {
        DB::beginTransaction();
        
        try {
            $user = $this->repository->restore($id);
            
            if (!$user) {
                DB::rollBack();
                return null;
            }
            
            // Create audit log
            $this->repository->createAuditLog([
                'user_id' => auth()->id(),
                'action' => 'restored',
                'auditable_type' => User::class,
                'auditable_id' => $user->id,
                'old_values' => null,
                'new_values' => json_encode($user->toArray()),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
            
            DB::commit();
            
            return $user->fresh(['roles', 'permissions']);
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Assign roles to user
     * 
     * @param int $id
     * @param array $roles
     * @return User|null
     */
    public function assignRoles(int $id, array $roles): ?User
    {
        $user = $this->repository->find($id);
        
        if (!$user) {
            return null;
        }
        
        DB::beginTransaction();
        
        try {
            $oldRoles = $user->roles->pluck('name')->toArray();
            
            $user->syncRoles($roles);
            
            // Create audit log
            $this->repository->createAuditLog([
                'user_id' => auth()->id(),
                'action' => 'assign_roles',
                'auditable_type' => User::class,
                'auditable_id' => $user->id,
                'old_values' => json_encode(['roles' => $oldRoles]),
                'new_values' => json_encode(['roles' => $roles]),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
            
            DB::commit();
            
            return $user->fresh(['roles', 'permissions']);
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get user's all permissions
     * 
     * @param int $id
     * @return array|null
     */
    public function getUserPermissions(int $id): ?array
    {
        $user = $this->repository->find($id);
        
        if (!$user) {
            return null;
        }
        
        return [
            'direct_permissions' => $user->permissions->pluck('name')->toArray(),
            'role_permissions' => $user->getPermissionsViaRoles()->pluck('name')->toArray(),
            'all_permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
        ];
    }
}
