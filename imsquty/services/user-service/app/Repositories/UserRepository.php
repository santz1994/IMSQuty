<?php

namespace App\Repositories;

use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Shared\Repositories\BaseRepository;

/**
 * User Repository
 * 
 * Data access layer for users
 */
class UserRepository extends BaseRepository
{
    /**
     * Specify Model class name
     *
     * @return string
     */
    protected function model(): string
    {
        return User::class;
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

    /**
     * Get all users with filters and pagination
     * 
     * @param array $filters
     * @param int $perPage
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function getAllWithFilters(array $filters, int $perPage = 15)
    {
        $query = User::with(['roles', 'permissions', 'division']);
        
        // Status filter
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        
        // Role filter
        if (isset($filters['role'])) {
            $query->role($filters['role']);
        }
        
        // Division filter
        if (isset($filters['division_id'])) {
            $query->where('division_id', $filters['division_id']);
        }
        
        // Search filter (username, email, name)
        if (isset($filters['search']) && !empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%");
            });
        }
        
        // Ordering
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);
        
        return $query->paginate($perPage);
    }

    /**
     * Find user by ID (alias for findById for compatibility)
     * 
     * @param int $id
     * @param bool $withTrashed
     * @return User|null
     */
    public function find(int $id, bool $withTrashed = false): ?User
    {
        return $this->findById($id, $withTrashed);
    }

    /**
     * Restore soft-deleted user by ID
     * 
     * @param int $id
     * @return bool
     */
    public function restore(int $id): bool
    {
        $user = User::withTrashed()->find($id);
        
        if ($user && $user->trashed()) {
            $user->restore();
            return true;
        }
        
        return false;
    }
}
