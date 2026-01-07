<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\UserBulkController;
use App\Http\Controllers\MetricsController;

/*
|--------------------------------------------------------------------------
| API Routes - User Service
|--------------------------------------------------------------------------
|
| Port: 8002
| Prefix: /api/v1
|
*/

// Monitoring endpoints (no auth required for Prometheus)
Route::get('/health', [MetricsController::class, 'health']);
Route::get('/metrics', [MetricsController::class, 'index']);

Route::prefix('v1')->group(function () {
    
    // Health check (legacy - kept for backward compatibility)
    Route::get('/health', function () {
        return response()->json([
            'success' => true,
            'service' => 'user-service',
            'status' => 'healthy',
            'timestamp' => now()->toIso8601String(),
        ]);
    });

    // User management endpoints (require authentication)
    Route::middleware('auth:sanctum')->group(function () {
        
        // User CRUD
        Route::prefix('users')->group(function () {
            Route::get('/', [UserController::class, 'index']);
            Route::post('/', [UserController::class, 'store']);
            Route::get('/{user}', [UserController::class, 'show']);
            Route::put('/{user}', [UserController::class, 'update']);
            Route::delete('/{user}', [UserController::class, 'destroy']);
            Route::post('/{user}/restore', [UserController::class, 'restore']);
            Route::post('/{user}/roles', [UserController::class, 'assignRoles']);
            Route::get('/{user}/permissions', [UserController::class, 'permissions']);
        });
        
        // User Profile Management
        Route::prefix('users/{user}/profile')->group(function () {
            Route::get('/', [UserProfileController::class, 'show']);
            Route::put('/', [UserProfileController::class, 'update']);
            Route::post('/avatar', [UserProfileController::class, 'uploadAvatar']);
            Route::delete('/avatar', [UserProfileController::class, 'removeAvatar']);
            Route::put('/preferences', [UserProfileController::class, 'updatePreferences']);
            Route::get('/activity', [UserProfileController::class, 'activityLog']);
            Route::post('/change-password', [UserProfileController::class, 'changePassword']);
        });
        
        // Bulk Operations
        Route::prefix('users/bulk')->group(function () {
            Route::post('/import', [UserBulkController::class, 'import']);
            Route::post('/export', [UserBulkController::class, 'export']);
            Route::get('/template', [UserBulkController::class, 'template']);
            Route::post('/update', [UserBulkController::class, 'bulkUpdate']);
            Route::post('/delete', [UserBulkController::class, 'bulkDelete']);
            Route::post('/assign-roles', [UserBulkController::class, 'bulkAssignRoles']);
        });
    });
});
