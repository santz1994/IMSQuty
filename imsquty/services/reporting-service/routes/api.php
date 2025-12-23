<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReportController;

Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    // Reports - specific routes first (before {id})
    Route::post('/reports/generate', [ReportController::class, 'generate']);
    Route::get('/reports/statistics', [ReportController::class, 'statistics']);
    Route::get('/reports', [ReportController::class, 'index']);
    Route::get('/reports/{id}', [ReportController::class, 'show']);
    
    // Schedules
    Route::post('/schedules/process-due', [ReportController::class, 'processDue']);
    Route::get('/schedules', [ReportController::class, 'schedules']);
    Route::post('/schedules', [ReportController::class, 'createSchedule']);
    
    Route::get('/health', fn() => response()->json([
        'status' => 'healthy',
        'service' => 'reporting-service',
        'timestamp' => now()->toISOString()
    ]));
});
