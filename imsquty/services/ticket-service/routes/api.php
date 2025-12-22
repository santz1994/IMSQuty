<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TicketController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Health check endpoint
Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'service' => 'ticket-service',
        'status' => 'healthy',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// API v1 routes
Route::prefix('v1')->group(function () {
    
    // Protected routes (require authentication)
    Route::middleware('auth:sanctum')->group(function () {
        
        // Ticket CRUD routes
        Route::get('/tickets', [TicketController::class, 'index']); // List all tickets
        Route::post('/tickets', [TicketController::class, 'store']); // Create new ticket
        Route::get('/tickets/{id}', [TicketController::class, 'show']); // Get single ticket
        Route::put('/tickets/{id}', [TicketController::class, 'update']); // Update ticket
        Route::delete('/tickets/{id}', [TicketController::class, 'destroy']); // Delete ticket
        
        // Ticket operations
        Route::post('/tickets/{id}/restore', [TicketController::class, 'restore']); // Restore deleted ticket
        Route::post('/tickets/{id}/assign', [TicketController::class, 'assign']); // Assign ticket to user
        Route::post('/tickets/{id}/comments', [TicketController::class, 'addComment']); // Add comment
        Route::post('/tickets/{id}/status', [TicketController::class, 'changeStatus']); // Change status
        
        // Ticket statistics
        Route::get('/tickets/stats/summary', [TicketController::class, 'statistics']); // Get statistics
    });
});
