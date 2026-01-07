<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\UserRBACController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Auth Service
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    
    // ==================== PUBLIC ROUTES ====================
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login'])
            ->middleware('throttle:5,1')
            ->name('auth.login');
        Route::post('/refresh', [AuthController::class, 'refresh'])
            ->name('auth.refresh');
    });

    // ==================== PROTECTED ROUTES ====================
    Route::middleware('auth:api')->group(function () {
        
        // Auth endpoints
        Route::prefix('auth')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');
            Route::get('/me', [AuthController::class, 'me'])->name('auth.me');
        });

        // ==================== RBAC ROUTES ====================
        
        // Roles Management
        Route::prefix('roles')->group(function () {
            Route::get('/', [RoleController::class, 'index'])->name('roles.index');
            Route::post('/', [RoleController::class, 'store'])->name('roles.store');
            Route::get('/{id}', [RoleController::class, 'show'])->name('roles.show');
            Route::put('/{id}', [RoleController::class, 'update'])->name('roles.update');
            Route::delete('/{id}', [RoleController::class, 'destroy'])->name('roles.destroy');
            
            // Sync permissions for role
            Route::post('/{id}/permissions/sync', [RoleController::class, 'syncPermissions'])
                ->name('roles.permissions.sync');
        });

        // Permissions Management
        Route::prefix('permissions')->group(function () {
            Route::get('/', [PermissionController::class, 'index'])->name('permissions.index');
            Route::get('/{id}', [PermissionController::class, 'show'])->name('permissions.show');
        });

        // User Role & Permission Management
        Route::prefix('users/{userId}')->group(function () {
            // Get user roles and permissions
            Route::get('/roles', [UserRBACController::class, 'getUserRoles'])
                ->name('users.roles.index');
            Route::get('/permissions', [UserRBACController::class, 'getUserPermissions'])
                ->name('users.permissions.index');

            // Assign/Remove roles
            Route::post('/roles', [UserRBACController::class, 'assignRole'])
                ->name('users.roles.assign');
            Route::put('/roles', [UserRBACController::class, 'syncRoles'])
                ->name('users.roles.sync');
            Route::delete('/roles/{role}', [UserRBACController::class, 'removeRole'])
                ->name('users.roles.remove');

            // Grant/Revoke permissions
            Route::post('/permissions', [UserRBACController::class, 'givePermission'])
                ->name('users.permissions.give');
            Route::delete('/permissions/{permission}', [UserRBACController::class, 'revokePermission'])
                ->name('users.permissions.revoke');

            // Check permission/role
            Route::get('/check-permission/{permission}', [UserRBACController::class, 'checkPermission'])
                ->name('users.check.permission');
            Route::get('/check-role/{role}', [UserRBACController::class, 'checkRole'])
                ->name('users.check.role');
        });
    });
    
    // ==================== HEALTH CHECK ====================
    Route::get('/health', function () {
        return response()->json([
            'success' => true,
            'service' => 'auth-service',
            'status' => 'healthy',
            'timestamp' => now()->toIso8601String()
        ]);
    })->name('health');
});

