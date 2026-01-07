<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

/**
 * Metrics Controller
 * 
 * Exposes Prometheus-compatible metrics for monitoring
 */
class MetricsController extends Controller
{
    /**
     * Get metrics in Prometheus format
     */
    public function index()
    {
        $metrics = [];
        
        // ========================================
        // AUTHENTICATION METRICS
        // ========================================
        
        // Total registered users
        $totalUsers = DB::table('users')->count();
        $metrics[] = "# HELP auth_users_total Total number of registered users";
        $metrics[] = "# TYPE auth_users_total gauge";
        $metrics[] = "auth_users_total $totalUsers";
        
        // Active users (logged in within 24h)
        $activeUsers = DB::table('user_sessions')
            ->where('is_active', true)
            ->where('last_active_at', '>=', now()->subDay())
            ->distinct('user_id')
            ->count('user_id');
        $metrics[] = "# HELP auth_active_users Active users in last 24 hours";
        $metrics[] = "# TYPE auth_active_users gauge";
        $metrics[] = "auth_active_users $activeUsers";
        
        // Total login attempts (last 24h)
        $loginAttempts = DB::table('login_history')
            ->where('attempted_at', '>=', now()->subDay())
            ->count();
        $metrics[] = "# HELP auth_login_attempts_total Total login attempts in last 24h";
        $metrics[] = "# TYPE auth_login_attempts_total counter";
        $metrics[] = "auth_login_attempts_total $loginAttempts";
        
        // Failed login attempts (last 24h)
        $failedLogins = DB::table('login_history')
            ->where('attempted_at', '>=', now()->subDay())
            ->where('status', 'failed')
            ->count();
        $metrics[] = "# HELP auth_login_failures_total Failed login attempts in last 24h";
        $metrics[] = "# TYPE auth_login_failures_total counter";
        $metrics[] = "auth_login_failures_total $failedLogins";
        
        // Login success rate
        $successRate = $loginAttempts > 0 ? round(($loginAttempts - $failedLogins) / $loginAttempts, 4) : 1.0;
        $metrics[] = "# HELP auth_login_success_rate Login success rate (0.0 to 1.0)";
        $metrics[] = "# TYPE auth_login_success_rate gauge";
        $metrics[] = "auth_login_success_rate $successRate";
        
        // ========================================
        // MFA METRICS
        // ========================================
        
        // Users with MFA enabled
        $mfaEnabled = DB::table('users')->where('mfa_enabled', true)->count();
        $metrics[] = "# HELP auth_mfa_enabled_users Users with MFA enabled";
        $metrics[] = "# TYPE auth_mfa_enabled_users gauge";
        $metrics[] = "auth_mfa_enabled_users $mfaEnabled";
        
        // MFA adoption rate
        $mfaRate = $totalUsers > 0 ? round($mfaEnabled / $totalUsers, 4) : 0;
        $metrics[] = "# HELP auth_mfa_adoption_rate MFA adoption rate (0.0 to 1.0)";
        $metrics[] = "# TYPE auth_mfa_adoption_rate gauge";
        $metrics[] = "auth_mfa_adoption_rate $mfaRate";
        
        // ========================================
        // SESSION METRICS
        // ========================================
        
        // Total active sessions
        $activeSessions = DB::table('user_sessions')
            ->where('is_active', true)
            ->where('expires_at', '>', now())
            ->count();
        $metrics[] = "# HELP auth_sessions_active Active user sessions";
        $metrics[] = "# TYPE auth_sessions_active gauge";
        $metrics[] = "auth_sessions_active $activeSessions";
        
        // Total sessions by device type
        $sessionsByDevice = DB::table('user_sessions')
            ->select('device', DB::raw('count(*) as count'))
            ->where('is_active', true)
            ->groupBy('device')
            ->get();
        
        $metrics[] = "# HELP auth_sessions_by_device Active sessions by device type";
        $metrics[] = "# TYPE auth_sessions_by_device gauge";
        foreach ($sessionsByDevice as $deviceStat) {
            $device = strtolower($deviceStat->device ?? 'unknown');
            $metrics[] = "auth_sessions_by_device{device=\"$device\"} {$deviceStat->count}";
        }
        
        // ========================================
        // RBAC METRICS
        // ========================================
        
        // Total roles
        $totalRoles = DB::table('roles')->count();
        $metrics[] = "# HELP auth_roles_total Total number of roles";
        $metrics[] = "# TYPE auth_roles_total gauge";
        $metrics[] = "auth_roles_total $totalRoles";
        
        // Total permissions
        $totalPermissions = DB::table('permissions')->count();
        $metrics[] = "# HELP auth_permissions_total Total number of permissions";
        $metrics[] = "# TYPE auth_permissions_total gauge";
        $metrics[] = "auth_permissions_total $totalPermissions";
        
        // Users by role
        $usersByRole = DB::table('model_has_roles')
            ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
            ->select('roles.name', DB::raw('count(*) as count'))
            ->groupBy('roles.name')
            ->get();
        
        $metrics[] = "# HELP auth_users_by_role Number of users per role";
        $metrics[] = "# TYPE auth_users_by_role gauge";
        foreach ($usersByRole as $roleStat) {
            $role = strtolower(str_replace(' ', '_', $roleStat->name));
            $metrics[] = "auth_users_by_role{role=\"$role\"} {$roleStat->count}";
        }
        
        // ========================================
        // SECURITY METRICS
        // ========================================
        
        // Locked accounts
        $lockedAccounts = DB::table('users')
            ->where('account_locked_until', '>', now())
            ->count();
        $metrics[] = "# HELP auth_accounts_locked Currently locked accounts";
        $metrics[] = "# TYPE auth_accounts_locked gauge";
        $metrics[] = "auth_accounts_locked $lockedAccounts";
        
        // Password resets (last 24h)
        $passwordResets = DB::table('password_history')
            ->where('created_at', '>=', now()->subDay())
            ->count();
        $metrics[] = "# HELP auth_password_resets_24h Password resets in last 24h";
        $metrics[] = "# TYPE auth_password_resets_24h counter";
        $metrics[] = "auth_password_resets_24h $passwordResets";
        
        // ========================================
        // PERFORMANCE METRICS
        // ========================================
        
        // Database connection pool
        try {
            $dbConnections = DB::select("SHOW STATUS WHERE Variable_name = 'Threads_connected'");
            if (!empty($dbConnections)) {
                $connections = $dbConnections[0]->Value;
                $metrics[] = "# HELP auth_db_connections Active database connections";
                $metrics[] = "# TYPE auth_db_connections gauge";
                $metrics[] = "auth_db_connections $connections";
            }
        } catch (\Exception $e) {
            // Skip if MySQL status not available
        }
        
        // Cache hit rate (if using Redis/Memcached)
        if (config('cache.default') !== 'file') {
            $cacheHits = Cache::get('metrics_cache_hits', 0);
            $cacheMisses = Cache::get('metrics_cache_misses', 0);
            $totalCacheOps = $cacheHits + $cacheMisses;
            $cacheHitRate = $totalCacheOps > 0 ? round($cacheHits / $totalCacheOps, 4) : 0;
            
            $metrics[] = "# HELP auth_cache_hit_rate Cache hit rate (0.0 to 1.0)";
            $metrics[] = "# TYPE auth_cache_hit_rate gauge";
            $metrics[] = "auth_cache_hit_rate $cacheHitRate";
        }
        
        // ========================================
        // SYSTEM HEALTH
        // ========================================
        
        // Service uptime
        $uptime = Cache::remember('auth_service_start_time', 3600, function() {
            return now();
        });
        $uptimeSeconds = now()->diffInSeconds($uptime);
        $metrics[] = "# HELP auth_uptime_seconds Service uptime in seconds";
        $metrics[] = "# TYPE auth_uptime_seconds counter";
        $metrics[] = "auth_uptime_seconds $uptimeSeconds";
        
        // Health status
        $metrics[] = "# HELP auth_health_status Service health (1=healthy, 0=unhealthy)";
        $metrics[] = "# TYPE auth_health_status gauge";
        $metrics[] = "auth_health_status 1";
        
        // Return metrics in Prometheus format
        return response(implode("\n", $metrics) . "\n")
            ->header('Content-Type', 'text/plain; version=0.0.4');
    }
    
    /**
     * Health check endpoint
     */
    public function health()
    {
        try {
            // Check database connection
            DB::connection()->getPdo();
            
            // Check Redis connection (if configured)
            if (config('cache.default') === 'redis') {
                Cache::get('health_check');
            }
            
            return response()->json([
                'status' => 'healthy',
                'service' => 'auth-service',
                'timestamp' => now()->toIso8601String(),
                'checks' => [
                    'database' => 'ok',
                    'cache' => 'ok'
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'unhealthy',
                'service' => 'auth-service',
                'timestamp' => now()->toIso8601String(),
                'error' => $e->getMessage()
            ], 503);
        }
    }
}
