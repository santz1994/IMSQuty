<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\MetricsController;

// Monitoring endpoints (no auth required for Prometheus)
Route::get('/health', [MetricsController::class, 'health']);
Route::get('/metrics', [MetricsController::class, 'index']);

Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    // Report Management (9 endpoints)
    Route::get('/reports', [ReportController::class, 'index']);
    Route::get('/reports/types', [ReportController::class, 'reportTypes']);
    Route::get('/reports/statistics', [ReportController::class, 'statistics']);
    Route::get('/reports/{report}', [ReportController::class, 'show']);
    Route::post('/reports/generate', [ReportController::class, 'generate']);
    Route::get('/reports/{report}/download', [ReportController::class, 'download']);
    Route::delete('/reports/{report}', [ReportController::class, 'destroy']);
    
    // Schedule Management (7 endpoints)
    Route::get('/schedules', [ReportController::class, 'schedules']);
    Route::get('/schedules/{schedule}', [ReportController::class, 'showSchedule']);
    Route::post('/schedules', [ReportController::class, 'createSchedule']);
    Route::put('/schedules/{schedule}', [ReportController::class, 'updateSchedule']);
    Route::delete('/schedules/{schedule}', [ReportController::class, 'destroySchedule']);
    Route::post('/schedules/process-due', [ReportController::class, 'processDue']);
    
    // Health Check
    Route::get('/health', fn() => response()->json([
        'status' => 'healthy',
        'service' => 'reporting-service',
        'timestamp' => now()->toISOString()
    ]));
});
