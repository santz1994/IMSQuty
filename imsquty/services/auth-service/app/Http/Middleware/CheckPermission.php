<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Check Permission Middleware
 * 
 * Verifies that the authenticated user has the required permission(s)
 * 
 * Usage:
 * Route::middleware('permission:assets.create')->group(...)
 * Route::middleware('permission:assets.create,assets.update')->group(...) // any
 * 
 * @package App\Http\Middleware
 */
class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $permissions Comma-separated list of permissions
     * @param  string  $guard
     */
    public function handle(Request $request, Closure $next, string $permissions, string $guard = 'api'): Response
    {
        if (auth($guard)->guest()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        $user = auth($guard)->user();

        // Split permissions by comma
        $requiredPermissions = explode(',', $permissions);

        // Check if user has any of the required permissions
        $hasPermission = false;
        foreach ($requiredPermissions as $permission) {
            if ($user->hasPermission(trim($permission))) {
                $hasPermission = true;
                break;
            }
        }

        if (!$hasPermission) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden - Insufficient permissions',
                'required_permissions' => $requiredPermissions,
            ], 403);
        }

        return $next($request);
    }
}
