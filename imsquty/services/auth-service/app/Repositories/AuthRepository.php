<?php

namespace App\Repositories;

use App\Models\User;
use App\Models\LoginHistory;
use App\Models\AuditLog;
use Illuminate\Support\Facades\DB;

/**
 * Auth Repository
 * 
 * Data access layer for authentication
 * Handles database operations for users, login history, audit logs
 * 
 * @package App\Repositories
 */
class AuthRepository
{
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
     * Update last login timestamp
     * 
     * @param int $userId
     * @return void
     */
    public function updateLastLogin(int $userId): void
    {
        User::where('id', $userId)->update([
            'last_login_at' => now(),
            'last_login_ip' => request()->ip()
        ]);
    }

    /**
     * Create login history record
     * 
     * @param array $data
     * @return LoginHistory
     */
    public function createLoginHistory(array $data): LoginHistory
    {
        return LoginHistory::create([
            'user_id' => $data['user_id'] ?? null,
            'email' => $data['email'],
            'success' => $data['success'],
            'ip_address' => $data['ip_address'],
            'user_agent' => $data['user_agent'] ?? null,
            'attempted_at' => now()
        ]);
    }

    /**
     * Create audit log record
     * 
     * @param array $data
     * @return AuditLog
     */
    public function createAuditLog(array $data): AuditLog
    {
        return AuditLog::create([
            'user_id' => $data['user_id'],
            'action' => $data['action'],
            'resource' => $data['resource'],
            'resource_id' => $data['resource_id'] ?? null,
            'old_values' => $data['old_values'] ?? null,
            'new_values' => $data['new_values'] ?? null,
            'ip_address' => $data['ip_address'],
            'user_agent' => $data['user_agent'] ?? null
        ]);
    }

    /**
     * Get login history for user
     * 
     * @param int $userId
     * @param int $limit
     * @return \Illuminate\Support\Collection
     */
    public function getLoginHistory(int $userId, int $limit = 10): \Illuminate\Support\Collection
    {
        return LoginHistory::where('user_id', $userId)
            ->orderBy('attempted_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get failed login attempts in time range
     * 
     * @param string $email
     * @param int $minutes
     * @return int
     */
    public function getFailedAttemptsCount(string $email, int $minutes = 15): int
    {
        return LoginHistory::where('email', $email)
            ->where('success', false)
            ->where('attempted_at', '>=', now()->subMinutes($minutes))
            ->count();
    }
}
