<?php

use App\Http\Controllers\MeetingRoomController;
use App\Http\Controllers\MetricsController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\BookingWorkflowController;
use App\Http\Controllers\AvailabilityController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Meeting Room Service
|--------------------------------------------------------------------------
*/

// Monitoring endpoints (no auth required for Prometheus)
Route::get('/health', [MetricsController::class, 'health']);
Route::get('/metrics', [MetricsController::class, 'index']);

// API v1 routes
Route::prefix('v1')->group(function () {
    
    // Meeting Rooms (public read, protected write)
    Route::prefix('meeting-rooms')->group(function () {
        // Public endpoints
        Route::get('/', [MeetingRoomController::class, 'index'])->name('meeting-rooms.index');
        Route::get('/{id}', [MeetingRoomController::class, 'show'])->name('meeting-rooms.show');
        Route::post('/available', [MeetingRoomController::class, 'availableRooms']);
        Route::post('/check-availability', [MeetingRoomController::class, 'checkAvailability']);
        
        // Protected endpoints (require authentication)
        Route::middleware(['auth:sanctum'])->group(function () {
            Route::post('/', [MeetingRoomController::class, 'store']);
            Route::put('/{id}', [MeetingRoomController::class, 'update']);
            Route::delete('/{id}', [MeetingRoomController::class, 'destroy']);
            Route::get('/{id}/statistics', [MeetingRoomController::class, 'statistics']);
        });
    });

    // Bookings (all protected)
    Route::middleware(['auth:sanctum'])->prefix('bookings')->group(function () {
        // Query endpoints (must come before /{id} routes)
        Route::get('/my/bookings', [BookingController::class, 'myBookings']);
        Route::get('/query/today', [BookingController::class, 'today']);
        Route::get('/query/upcoming', [BookingController::class, 'upcoming']);
        
        // Standard CRUD
        Route::get('/', [BookingController::class, 'index']);
        Route::post('/', [BookingController::class, 'store']);
        Route::get('/{id}', [BookingController::class, 'show']);
        Route::put('/{id}', [BookingController::class, 'update']);
        Route::delete('/{id}', [BookingController::class, 'destroy']);
        
        // Special actions
        Route::post('/{id}/approve', [BookingWorkflowController::class, 'approve']);
        Route::post('/{id}/reject', [BookingWorkflowController::class, 'reject']);
        Route::post('/{id}/cancel', [BookingWorkflowController::class, 'cancel']);
        Route::post('/{id}/check-in', [BookingWorkflowController::class, 'checkIn']);
        Route::post('/{id}/check-out', [BookingWorkflowController::class, 'checkOut']);
        Route::post('/{id}/feedback', [BookingWorkflowController::class, 'submitFeedback']);
        Route::get('/query/statistics', [BookingController::class, 'statistics']);
    });

    // Availability (public access for checking)
    Route::prefix('availability')->group(function () {
        Route::post('/check', [AvailabilityController::class, 'checkAvailability']);
        Route::post('/find-rooms', [AvailabilityController::class, 'findAvailableRooms']);
        Route::get('/room/{roomId}/schedule', [AvailabilityController::class, 'getRoomSchedule']);
        Route::post('/matrix', [AvailabilityController::class, 'getAvailabilityMatrix']);
    });
});
