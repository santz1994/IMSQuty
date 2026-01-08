<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\AssetModelController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\MetricsController;
use App\Http\Controllers\WarrantyController;
use App\Http\Controllers\MovementController;
use App\Http\Controllers\ImportExportController;

/*
|--------------------------------------------------------------------------
| Asset Service API Routes
|--------------------------------------------------------------------------
|
| Here are all API routes for the Asset Service.
| All routes are prefixed with /api/v1 and protected with auth middleware.
|
*/

// Monitoring endpoints (no auth required for Prometheus)
Route::get('/health', [MetricsController::class, 'health']);
Route::get('/metrics', [MetricsController::class, 'index']);

Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    
    // Asset Routes
    Route::prefix('assets')->group(function () {
        // Statistics (must be before {id} routes)
        Route::get('/statistics', [AssetController::class, 'statistics']);
        
        // Expiring warranties
        Route::get('/warranties/expiring', [AssetController::class, 'expiringWarranties']);
        
        // QR Code lookup
        Route::get('/qr/{qrCode}', [AssetController::class, 'qrCode']);
        
        // Standard CRUD
        Route::get('/', [AssetController::class, 'index']);
        Route::post('/', [AssetController::class, 'store']);
        Route::get('/{id}', [AssetController::class, 'show']);
        Route::put('/{id}', [AssetController::class, 'update']);
        Route::delete('/{id}', [AssetController::class, 'destroy']);
        
        // Additional actions
        Route::post('/{id}/restore', [AssetController::class, 'restore']);
        Route::post('/{id}/assign', [AssetController::class, 'assign']);
        Route::post('/{id}/transfer', [AssetController::class, 'transfer']);
    });

    // Asset Model Routes
    Route::prefix('asset-models')->group(function () {
        // Filtering routes (must be before {id} routes)
        Route::get('/by-type/{typeId}', [AssetModelController::class, 'byType']);
        Route::get('/by-manufacturer/{manufacturerId}', [AssetModelController::class, 'byManufacturer']);
        
        // Standard CRUD
        Route::get('/', [AssetModelController::class, 'index']);
        Route::post('/', [AssetModelController::class, 'store']);
        Route::get('/{id}', [AssetModelController::class, 'show']);
        Route::put('/{id}', [AssetModelController::class, 'update']);
        Route::delete('/{id}', [AssetModelController::class, 'destroy']);
        
        // Additional actions
        Route::post('/{id}/restore', [AssetModelController::class, 'restore']);
    });

    // Maintenance Routes
    Route::prefix('maintenance')->group(function () {
        // Statistics and special routes (before {id} routes)
        Route::get('/statistics', [MaintenanceController::class, 'getStatistics']);
        Route::get('/upcoming', [MaintenanceController::class, 'getUpcoming']);
        Route::get('/overdue', [MaintenanceController::class, 'getOverdue']);
        Route::get('/status/{status}', [MaintenanceController::class, 'getByStatus']);
        Route::get('/type/{type}', [MaintenanceController::class, 'getByType']);
        Route::get('/asset/{assetId}', [MaintenanceController::class, 'getByAsset']);
        
        // Standard CRUD
        Route::get('/{id}', [MaintenanceController::class, 'show']);
        Route::post('/', [MaintenanceController::class, 'store']);
        Route::put('/{id}', [MaintenanceController::class, 'update']);
        Route::delete('/{id}', [MaintenanceController::class, 'destroy']);
        
        // Actions
        Route::post('/{id}/complete', [MaintenanceController::class, 'complete']);
        Route::post('/{id}/cancel', [MaintenanceController::class, 'cancel']);
    });

    // Warranty Routes
    Route::prefix('warranties')->group(function () {
        // Special routes (before {assetId} routes)
        Route::get('/statistics', [WarrantyController::class, 'getStatistics']);
        Route::get('/expiring', [WarrantyController::class, 'getExpiring']);
        Route::get('/expired', [WarrantyController::class, 'getExpired']);
        Route::get('/active', [WarrantyController::class, 'getActive']);
        Route::get('/alerts', [WarrantyController::class, 'getExpiryAlerts']);
        
        // By asset
        Route::get('/asset/{assetId}', [WarrantyController::class, 'getByAsset']);
        Route::put('/asset/{assetId}', [WarrantyController::class, 'update']);
        Route::get('/asset/{assetId}/check-validity', [WarrantyController::class, 'checkValidity']);
    });

    // Movement Routes
    Route::prefix('movements')->group(function () {
        // Statistics and special routes (before {id} routes)
        Route::get('/statistics', [MovementController::class, 'getStatistics']);
        Route::get('/recent', [MovementController::class, 'getRecent']);
        Route::get('/asset/{assetId}', [MovementController::class, 'getByAsset']);
        Route::get('/asset/{assetId}/current-location', [MovementController::class, 'getCurrentLocation']);
        Route::get('/location/{locationId}', [MovementController::class, 'getByLocation']);
        Route::post('/date-range', [MovementController::class, 'getByDateRange']);
        
        // Standard CRUD
        Route::get('/{id}', [MovementController::class, 'show']);
        Route::post('/', [MovementController::class, 'store']);
        Route::delete('/{id}', [MovementController::class, 'destroy']);
    });    
    // Import/Export Routes
    Route::prefix('import-export')->group(function () {
        Route::post('/import', [ImportExportController::class, 'import']);
        Route::get('/export/excel', [ImportExportController::class, 'exportExcel']);
        Route::get('/export/csv', [ImportExportController::class, 'exportCSV']);
        Route::get('/template', [ImportExportController::class, 'downloadTemplate']);
    });});

/*
|--------------------------------------------------------------------------
| Route Documentation
|--------------------------------------------------------------------------
|
| Asset Endpoints:
| - GET    /api/v1/assets                      - List all assets (with filters)
| - POST   /api/v1/assets                      - Create new asset
| - GET    /api/v1/assets/{id}                 - Get asset by ID
| - PUT    /api/v1/assets/{id}                 - Update asset
| - DELETE /api/v1/assets/{id}                 - Delete asset (soft)
| - POST   /api/v1/assets/{id}/restore         - Restore deleted asset
| - POST   /api/v1/assets/{id}/assign          - Assign asset to user
| - POST   /api/v1/assets/{id}/transfer        - Transfer asset (location/user)
| - GET    /api/v1/assets/qr/{qrCode}          - Get asset by QR code
| - GET    /api/v1/assets/warranties/expiring  - Get expiring warranties
| - GET    /api/v1/assets/statistics           - Get asset statistics
|
| Asset Model Endpoints:
| - GET    /api/v1/asset-models                           - List all models (with filters)
| - POST   /api/v1/asset-models                           - Create new model
| - GET    /api/v1/asset-models/{id}                      - Get model by ID
| - PUT    /api/v1/asset-models/{id}                      - Update model
| - DELETE /api/v1/asset-models/{id}                      - Delete model (soft)
| - POST   /api/v1/asset-models/{id}/restore              - Restore deleted model
| - GET    /api/v1/asset-models/by-type/{typeId}          - Get models by asset type
| - GET    /api/v1/asset-models/by-manufacturer/{manufacturerId} - Get models by manufacturer
|
*/
