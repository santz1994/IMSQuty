<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\DivisionController;
use App\Http\Controllers\ManufacturerController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\WarrantyTypeController;
use App\Http\Controllers\PcspecController;
use App\Http\Controllers\MetricsController;

/*
|--------------------------------------------------------------------------
| API Routes - Master Data Service
|--------------------------------------------------------------------------
|
| All routes for master data management (locations, divisions, manufacturers, etc.)
| Requires authentication via JWT token (auth:sanctum middleware)
| Rate limiting: 60 requests per minute
|

// Monitoring endpoints (no auth required for Prometheus)
Route::get('/health', [MetricsController::class, 'health']);
Route::get('/metrics', [MetricsController::class, 'index']);
*/

// Health check (no authentication required)
Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'service' => 'master-data-service',
        'status' => 'healthy',
        'timestamp' => now()->toIso8601String()
    ]);
});

// Protected routes (require authentication)
Route::middleware(['auth:sanctum', 'throttle:60,1'])->prefix('v1')->group(function () {
    
    // ========================================
    // LOCATIONS ROUTES
    // ========================================
    Route::prefix('locations')->group(function () {
        Route::get('/', [LocationController::class, 'index']);           // List all
        Route::post('/', [LocationController::class, 'store']);          // Create new
        Route::get('/active', [LocationController::class, 'active']);    // Active only
        Route::get('/hierarchy', [LocationController::class, 'hierarchy']); // Hierarchical structure
        Route::get('/{id}', [LocationController::class, 'show']);        // Show single
        Route::put('/{id}', [LocationController::class, 'update']);      // Update
        Route::patch('/{id}', [LocationController::class, 'update']);    // Update (PATCH)
        Route::delete('/{id}', [LocationController::class, 'destroy']);  // Soft delete
        Route::post('/{id}/restore', [LocationController::class, 'restore']); // Restore
    });

    // ========================================
    // DIVISIONS ROUTES
    // ========================================
    Route::prefix('divisions')->group(function () {
        Route::get('/', [DivisionController::class, 'index']);
        Route::post('/', [DivisionController::class, 'store']);
        Route::get('/active', [DivisionController::class, 'active']);
        Route::get('/hierarchy', [DivisionController::class, 'hierarchy']);
        Route::get('/{id}', [DivisionController::class, 'show']);
        Route::put('/{id}', [DivisionController::class, 'update']);
        Route::patch('/{id}', [DivisionController::class, 'update']);
        Route::delete('/{id}', [DivisionController::class, 'destroy']);
        Route::post('/{id}/restore', [DivisionController::class, 'restore']);
    });

    // ========================================
    // MANUFACTURERS ROUTES
    // ========================================
    Route::prefix('manufacturers')->group(function () {
        Route::get('/', [ManufacturerController::class, 'index']);
        Route::post('/', [ManufacturerController::class, 'store']);
        Route::get('/active', [ManufacturerController::class, 'active']);
        Route::get('/{id}', [ManufacturerController::class, 'show']);
        Route::put('/{id}', [ManufacturerController::class, 'update']);
        Route::patch('/{id}', [ManufacturerController::class, 'update']);
        Route::delete('/{id}', [ManufacturerController::class, 'destroy']);
        Route::post('/{id}/restore', [ManufacturerController::class, 'restore']);
    });

    // ========================================
    // SUPPLIERS ROUTES
    // ========================================
    Route::prefix('suppliers')->group(function () {
        Route::get('/', [SupplierController::class, 'index']);
        Route::post('/', [SupplierController::class, 'store']);
        Route::get('/active', [SupplierController::class, 'active']);
        Route::get('/{id}', [SupplierController::class, 'show']);
        Route::put('/{id}', [SupplierController::class, 'update']);
        Route::patch('/{id}', [SupplierController::class, 'update']);
        Route::delete('/{id}', [SupplierController::class, 'destroy']);
        Route::post('/{id}/restore', [SupplierController::class, 'restore']);
    });

    // ========================================
    // WARRANTY TYPES ROUTES
    // ========================================
    Route::prefix('warranty-types')->group(function () {
        Route::get('/', [WarrantyTypeController::class, 'index']);
        Route::post('/', [WarrantyTypeController::class, 'store']);
        Route::get('/active', [WarrantyTypeController::class, 'active']);
        Route::get('/{id}', [WarrantyTypeController::class, 'show']);
        Route::put('/{id}', [WarrantyTypeController::class, 'update']);
        Route::patch('/{id}', [WarrantyTypeController::class, 'update']);
        Route::delete('/{id}', [WarrantyTypeController::class, 'destroy']);
        Route::post('/{id}/restore', [WarrantyTypeController::class, 'restore']);
    });

    // ========================================
    // PC SPECIFICATIONS ROUTES
    // ========================================
    Route::prefix('pcspecs')->group(function () {
        Route::get('/', [PcspecController::class, 'index']);
        Route::post('/', [PcspecController::class, 'store']);
        Route::get('/active', [PcspecController::class, 'active']);
        Route::get('/{id}', [PcspecController::class, 'show']);
        Route::put('/{id}', [PcspecController::class, 'update']);
        Route::patch('/{id}', [PcspecController::class, 'update']);
        Route::delete('/{id}', [PcspecController::class, 'destroy']);
        Route::post('/{id}/restore', [PcspecController::class, 'restore']);
    });
});

/*
|--------------------------------------------------------------------------
| Total Endpoints: 49
|--------------------------------------------------------------------------
| 
| Health check: 1 endpoint (public)
| Locations: 9 endpoints (authenticated)
| Divisions: 9 endpoints (authenticated)
| Manufacturers: 8 endpoints (authenticated)
| Suppliers: 8 endpoints (authenticated)
| Warranty Types: 8 endpoints (authenticated)
| PC Specs: 8 endpoints (authenticated)
|
| All authenticated routes require:
| - JWT token in Authorization header (Bearer token)
| - Rate limit: 60 requests per minute per user
|
*/
