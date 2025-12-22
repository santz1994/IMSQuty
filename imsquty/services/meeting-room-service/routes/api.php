<?php

use App\Http\Controllers\MeetingRoomController;
use App\Http\Controllers\BookingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Meeting Room Service
|--------------------------------------------------------------------------
*/

// Health check
Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'service' => 'meeting-room-service',
        'status' => 'healthy',
        'timestamp' => now()->toISOString(),
    ]);
});

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
        Route::post('/{id}/approve', [BookingController::class, 'approve']);
        Route::post('/{id}/reject', [BookingController::class, 'reject']);
        Route::post('/{id}/cancel', [BookingController::class, 'cancel']);
        Route::get('/query/statistics', [BookingController::class, 'statistics']);
    });
});
