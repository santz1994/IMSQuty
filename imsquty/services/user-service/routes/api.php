<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| API Routes - User Service
|--------------------------------------------------------------------------
|
| Port: 8002
| Prefix: /api/v1
|
*/

Route::prefix('v1')->group(function () {
    
    // Health check
    Route::get('/health', function () {
        return response()->json([
            'success' => true,
            'service' => 'user-service',
            'status' => 'healthy',
            'timestamp' => now()->toIso8601String(),
        ]);
    });

    // User management endpoints (require authentication)
    Route::prefix('users')->middleware('auth:sanctum')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::get('/{user}', [UserController::class, 'show']);
        Route::post('/', [UserController::class, 'store']);
        Route::put('/{user}', [UserController::class, 'update']);
        Route::delete('/{user}', [UserController::class, 'destroy']);
        Route::post('/{user}/restore', [UserController::class, 'restore']);
        Route::post('/{user}/roles', [UserController::class, 'assignRoles']);
        Route::get('/{user}/permissions', [UserController::class, 'permissions']);
    });
});
