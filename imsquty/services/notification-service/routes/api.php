<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NotificationController;

/*
|--------------------------------------------------------------------------
| API Routes - Notification Service
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Notification management - Specific routes first (must be before {id} parameter)
    Route::get('/notifications/statistics', [NotificationController::class, 'statistics']);
    Route::get('/notifications/unread', [NotificationController::class, 'unread']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllRead']);
    Route::post('/notifications/process-pending', [NotificationController::class, 'processPending']);
    Route::post('/notifications/retry-failed', [NotificationController::class, 'retryFailed']);
    
    // Notification CRUD
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications', [NotificationController::class, 'store']);
    Route::get('/notifications/{id}', [NotificationController::class, 'show']);
    Route::put('/notifications/{id}', [NotificationController::class, 'update']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    
    // Notification actions
    Route::post('/notifications/{id}/send', [NotificationController::class, 'send']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/{id}/cancel', [NotificationController::class, 'cancel']);
    
    // User notifications
    Route::get('/users/{userId}/notifications', [NotificationController::class, 'userNotifications']);
    
    // Health check
    Route::get('/health', function () {
        return response()->json([
            'status' => 'healthy',
            'service' => 'notification-service',
            'timestamp' => now()->toISOString()
        ]);
    });
});
