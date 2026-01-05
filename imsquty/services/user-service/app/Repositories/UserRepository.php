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
}
