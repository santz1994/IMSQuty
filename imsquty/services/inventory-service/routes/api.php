<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\InventoryController;

Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    Route::get('/inventory', [InventoryController::class, 'index']);
    Route::post('/inventory', [InventoryController::class, 'store']);
    Route::get('/inventory/low-stock', [InventoryController::class, 'lowStock']);
    Route::get('/inventory/statistics', [InventoryController::class, 'statistics']);
    Route::get('/inventory/{id}', [InventoryController::class, 'show']);
    Route::put('/inventory/{id}', [InventoryController::class, 'update']);
    Route::delete('/inventory/{id}', [InventoryController::class, 'destroy']);
    Route::post('/inventory/{id}/add-stock', [InventoryController::class, 'addStock']);
    Route::post('/inventory/{id}/reduce-stock', [InventoryController::class, 'reduceStock']);
    Route::post('/inventory/{id}/transfer', [InventoryController::class, 'transferStock']);
    
    Route::get('/health', fn() => response()->json([
        'status' => 'healthy',
        'service' => 'inventory-service',
        'timestamp' => now()->toISOString()
    ]));
});
