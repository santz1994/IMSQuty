<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\InventoryController;

Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    // Item Management
    Route::get('/items', [InventoryController::class, 'index']);
    Route::post('/items', [InventoryController::class, 'store']);
    Route::get('/items/low-stock', [InventoryController::class, 'lowStock']);
    Route::get('/items/out-of-stock', [InventoryController::class, 'outOfStock']);
    Route::get('/items/statistics', [InventoryController::class, 'statistics']);
    Route::get('/items/valuation', [InventoryController::class, 'valuation']);
    Route::post('/items/batch-update', [InventoryController::class, 'batchUpdate']);
    Route::get('/items/{id}', [InventoryController::class, 'show']);
    Route::put('/items/{id}', [InventoryController::class, 'update']);
    Route::delete('/items/{id}', [InventoryController::class, 'destroy']);
    
    // Stock Operations
    Route::post('/items/{id}/stock-in', [InventoryController::class, 'addStock']);
    Route::post('/items/{id}/stock-out', [InventoryController::class, 'reduceStock']);
    Route::post('/items/{id}/transfer', [InventoryController::class, 'transferStock']);
    Route::post('/items/{id}/adjust', [InventoryController::class, 'adjustStock']);
    Route::get('/items/{id}/movements', [InventoryController::class, 'movements']);
    
    // Health Check
    Route::get('/health', fn() => response()->json([
        'status' => 'healthy',
        'service' => 'inventory-service',
        'timestamp' => now()->toISOString()
    ]));
});
