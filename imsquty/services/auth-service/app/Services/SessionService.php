<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserSession;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Jenssegers\Agent\Agent;

/**
 * Session Service
 * 
 * Manages user sessions across devices
 */
class SessionService
{
    /**
     * Create new session for user
     */
    public function createSession(User $user, string $token, int $expiryMinutes = 1440): UserSession
    {
        $agent = new Agent();
        $agent->setUserAgent(request()->userAgent());

        return UserSession::create([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'token' => hash('sha256', $token),
            'device' => $agent->device(),
            'browser' => $agent->browser(),
            'os' => $agent->platform(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'last_active_at' => now(),
            'expires_at' => now()->addMinutes($expiryMinutes),
            'is_active' => true
        ]);
    }

    /**
     * Get all active sessions for user
     */
    public function getUserActiveSessions(User $user): Collection
    {
        return UserSession::where('user_id', $user->id)
            ->active()
            ->orderBy('last_active_at', 'desc')
            ->get();
    }

    /**
     * Get all sessions (including inactive) for user
     */
    public function getUserAllSessions(User $user, int $limit = 20): Collection
    {
        return UserSession::where('user_id', $user->id)
            ->orderBy('last_active_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Revoke specific session
     */
    public function revokeSession(string $sessionId): bool
    {
        $session = UserSession::find($sessionId);
        
        if ($session) {
            $session->revoke();
            return true;
        }

        return false;
    }

    /**
     * Revoke all sessions except current
     */
    public function revokeAllOtherSessions(User $user, string $currentToken): int
    {
        $currentTokenHash = hash('sha256', $currentToken);
        
        return UserSession::where('user_id', $user->id)
            ->where('token', '!=', $currentTokenHash)
            ->where('is_active', true)
            ->update(['is_active' => false]);
    }

    /**
     * Revoke all user sessions
     */
    public function revokeAllSessions(User $user): int
    {
        return UserSession::where('user_id', $user->id)
            ->where('is_active', true)
            ->update(['is_active' => false]);
    }

    /**
     * Update session last active timestamp
     */
    public function updateSessionActivity(string $token): void
    {
        $tokenHash = hash('sha256', $token);
        
        UserSession::where('token', $tokenHash)
            ->where('is_active', true)
            ->update(['last_active_at' => now()]);
    }

    /**
     * Clean expired sessions
     */
    public function cleanExpiredSessions(): int
    {
        return UserSession::where('expires_at', '<', now())
            ->where('is_active', true)
            ->update(['is_active' => false]);
    }

    /**
     * Get session by token
     */
    public function getSessionByToken(string $token): ?UserSession
    {
        $tokenHash = hash('sha256', $token);
        
        return UserSession::where('token', $tokenHash)
            ->active()
            ->first();
    }

    /**
     * Check if session is valid
     */
    public function isSessionValid(string $token): bool
    {
        return $this->getSessionByToken($token) !== null;
    }

    /**
     * Get session statistics for user
     */
    public function getSessionStatistics(User $user): array
    {
        return [
            'total_sessions' => UserSession::where('user_id', $user->id)->count(),
            'active_sessions' => UserSession::where('user_id', $user->id)->active()->count(),
            'devices_used' => UserSession::where('user_id', $user->id)
                ->distinct('device')
                ->count('device'),
            'last_login' => UserSession::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->first()?->created_at
        ];
    }
}
