<?php

namespace App\Repositories;

use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * User Repository
 * 
 * Data access layer for users
 */
class UserRepository
{
    /**
     * Get all users with filters and pagination
     * 
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAllWithFilters(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = User::with(['roles', 'permissions']);
        
        // Filter by status
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        
        // Filter by role
        if (isset($filters['role'])) {
            $query->role($filters['role']);
        }
        
        // Filter by division
        if (isset($filters['division_id'])) {
            $query->where('division_id', $filters['division_id']);
        }
        
        // Search by name, username, or email
        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * Find user by ID with relationships
     * 
     * @param int $id
     * @return User|null
     */
    public function findWithRelations(int $id): ?User
    {
        return User::with(['roles', 'permissions', 'division'])->find($id);
    }

    /**
     * Find user by ID
     * 
     * @param int $id
     * @return User|null
     */
    public function find(int $id): ?User
    {
        return User::find($id);
    }

    /**
     * Find user by email
     * 
     * @param string $email
     * @return User|null
     */
    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    /**
     * Find user by username
     * 
     * @param string $username
     * @return User|null
     */
    public function findByUsername(string $username): ?User
    {
        return User::where('username', $username)->first();
    }

    /**
     * Create new user
     * 
     * @param array $data
     * @return User
     */
    public function create(array $data): User
    {
        return User::create($data);
    }

    /**
     * Update user
     * 
     * @param int $id
     * @param array $data
     * @return User
     */
    public function update(int $id, array $data): User
    {
        $user = User::findOrFail($id);
        $user->update($data);
        return $user;
    }

    /**
     * Delete user (soft delete)
     * 
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool
    {
        $user = User::findOrFail($id);
        return $user->delete();
    }

    /**
     * Restore soft-deleted user
     * 
     * @param int $id
     * @return User|null
     */
    public function restore(int $id): ?User
    {
        $user = User::withTrashed()->find($id);
        
        if ($user && $user->trashed()) {
            $user->restore();
            return $user;
        }
        
        return null;
    }

    /**
     * Create audit log entry
     * 
     * @param array $data
     * @return AuditLog
     */
    public function createAuditLog(array $data): AuditLog
    {
        return AuditLog::create($data);
    }

    /**
     * Get users by role
     * 
     * @param string $role
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getUsersByRole(string $role)
    {
        return User::role($role)->get();
    }

    /**
     * Get active users count
     * 
     * @return int
     */
    public function getActiveUsersCount(): int
    {
        return User::where('status', 'active')->count();
    }
}
