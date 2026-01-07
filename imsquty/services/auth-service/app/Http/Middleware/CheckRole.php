<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Check Role Middleware
 * 
 * Verifies that the authenticated user has the required role(s)
 * 
 * Usage:
 * Route::middleware('role:Admin')->group(...)
 * Route::middleware('role:Admin,Manager')->group(...) // any
 * 
 * @package App\Http\Middleware
 */
class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $roles Comma-separated list of roles
     * @param  string  $guard
     */
    public function handle(Request $request, Closure $next, string $roles, string $guard = 'api'): Response
    {
        if (auth($guard)->guest()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        $user = auth($guard)->user();

        // Split roles by comma
        $requiredRoles = explode(',', $roles);

        // Check if user has any of the required roles
        $hasRole = false;
        foreach ($requiredRoles as $role) {
            if ($user->hasRole(trim($role))) {
                $hasRole = true;
                break;
            }
        }

        if (!$hasRole) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden - Insufficient role',
                'required_roles' => $requiredRoles,
            ], 403);
        }

        return $next($request);
    }
}
