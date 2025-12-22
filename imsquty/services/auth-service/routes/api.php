<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Auth Service
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    
    // Public routes (no authentication required)
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1')->name('auth.login');
        Route::post('/refresh', [AuthController::class, 'refresh'])->name('auth.refresh');
    });

    // Protected routes (authentication required)
    Route::middleware('auth:api')->prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');
        Route::get('/me', [AuthController::class, 'me'])->name('auth.me');
    });
    
    // Health check
    Route::get('/health', function () {
        return response()->json([
            'success' => true,
            'service' => 'auth-service',
            'status' => 'healthy',
            'timestamp' => now()->toIso8601String()
        ]);
    })->name('health');
});
