<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\MfaController;
use App\Http\Controllers\MetricsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\PagePermissionController;
use App\Http\Controllers\UserRBACController;
use App\Http\Controllers\AuditLogController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Auth Service
|--------------------------------------------------------------------------
*/

// ==================== MONITORING ENDPOINTS ====================
// Health and metrics (no auth required for Prometheus)
Route::get('/health', [MetricsController::class, 'health']);
Route::get('/metrics', [MetricsController::class, 'index']);

// Dashboard endpoints (no auth for now - could add later)
Route::prefix('dashboard')->group(function () {
    Route::get('/health', [DashboardController::class, 'systemHealth']);
    Route::get('/stats', [DashboardController::class, 'aggregatedStats']);
    Route::get('/quick-stats', [DashboardController::class, 'quickStats']);
    
    // Role-based dashboard endpoints (Phase 3)
    Route::middleware('auth:api')->group(function () {
        // Director Dashboard
        Route::prefix('director')->group(function () {
            Route::get('/business-metrics', [DashboardController::class, 'directorBusinessMetrics']);
            Route::get('/financial-overview', [DashboardController::class, 'directorFinancialOverview']);
            Route::get('/department-performance', [DashboardController::class, 'directorDepartmentPerformance']);
            Route::get('/business-trends', [DashboardController::class, 'directorBusinessTrends']);
        });
        
        // Manager Dashboard
        Route::prefix('manager')->group(function () {
            Route::get('/team-metrics', [DashboardController::class, 'managerTeamMetrics']);
            Route::get('/pending-approvals', [DashboardController::class, 'managerPendingApprovals']);
        });
        
        // HR Dashboard
        Route::prefix('hr')->group(function () {
            Route::get('/metrics', [DashboardController::class, 'hrMetrics']);
        });
        
        // User Dashboard
        Route::prefix('user')->group(function () {
            Route::get('/metrics', [DashboardController::class, 'userMetrics']);
        });
    });
});

Route::prefix('v1')->group(function () {
    
    // ==================== PUBLIC ROUTES ====================
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login'])
            ->middleware('throttle:5,1')
            ->name('auth.login');
        Route::post('/refresh', [AuthController::class, 'refresh'])
            ->name('auth.refresh');
    });

    // ==================== PROTECTED ROUTES ====================
    Route::middleware('auth:api')->group(function () {
        
        // Auth endpoints
        Route::prefix('auth')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');
            Route::get('/me', [AuthController::class, 'me'])->name('auth.me');
        });

        // ==================== MFA & SESSION MANAGEMENT ====================
        
        // MFA endpoints
        Route::prefix('mfa')->group(function () {
            Route::get('/status', [MfaController::class, 'getMfaStatus'])->name('mfa.status');
            Route::post('/setup', [MfaController::class, 'setupMfa'])->name('mfa.setup');
            Route::post('/enable', [MfaController::class, 'enableMfa'])->name('mfa.enable');
            Route::post('/verify', [MfaController::class, 'verifyMfa'])->name('mfa.verify');
            Route::post('/disable', [MfaController::class, 'disableMfa'])->name('mfa.disable');
            Route::post('/backup-codes/regenerate', [MfaController::class, 'regenerateBackupCodes'])
                ->name('mfa.backup-codes.regenerate');
        });

        // Session Management endpoints
        Route::prefix('sessions')->group(function () {
            Route::get('/', [MfaController::class, 'getSessions'])->name('sessions.index');
            Route::get('/statistics', [MfaController::class, 'getSessionStatistics'])
                ->name('sessions.statistics');
            Route::delete('/{sessionId}', [MfaController::class, 'revokeSession'])
                ->name('sessions.revoke');
            Route::post('/revoke-all-others', [MfaController::class, 'revokeAllOtherSessions'])
                ->name('sessions.revoke-all-others');
        });

        // Login History endpoint
        Route::get('/login-history', [MfaController::class, 'getLoginHistory'])
            ->name('login-history.index');

        // ==================== RBAC ROUTES ====================
        
        // Roles Management
        Route::prefix('roles')->group(function () {
            Route::get('/', [RoleController::class, 'index'])->name('roles.index');
            Route::post('/', [RoleController::class, 'store'])->name('roles.store');
            Route::get('/{id}', [RoleController::class, 'show'])->name('roles.show');
            Route::put('/{id}', [RoleController::class, 'update'])->name('roles.update');
            Route::delete('/{id}', [RoleController::class, 'destroy'])->name('roles.destroy');
            
            // Sync permissions for role
            Route::post('/{id}/permissions/sync', [RoleController::class, 'syncPermissions'])
                ->name('roles.permissions.sync');
        });

        // Permissions Management
        Route::prefix('permissions')->group(function () {
            Route::get('/', [PermissionController::class, 'index'])->name('permissions.index');
            Route::get('/{id}', [PermissionController::class, 'show'])->name('permissions.show');
        });

        // Page Permissions Management (NEW)
        Route::prefix('page-permissions')->group(function () {
            Route::get('/pages', [PagePermissionController::class, 'getAllPages'])->name('pages.index');
            Route::get('/my-pages', [PagePermissionController::class, 'getMyAccessiblePages'])->name('pages.my');
            
            // Role-based page permissions
            Route::get('/roles/{roleId}/pages', [PagePermissionController::class, 'getRolePages'])->name('roles.pages');
            Route::post('/roles/{roleId}/pages', [PagePermissionController::class, 'assignPageToRole'])->name('roles.pages.assign');
            Route::post('/roles/{roleId}/pages/sync', [PagePermissionController::class, 'syncRolePages'])->name('roles.pages.sync');
            Route::delete('/roles/{roleId}/pages/{pageId}', [PagePermissionController::class, 'removePageFromRole'])->name('roles.pages.remove');
        });

        // User Role & Permission Management
        Route::prefix('users/{userId}')->group(function () {
            // Get user roles and permissions
            Route::get('/roles', [UserRBACController::class, 'getUserRoles'])
                ->name('users.roles.index');
            Route::get('/permissions', [UserRBACController::class, 'getUserPermissions'])
                ->name('users.permissions.index');

            // Assign/Remove roles
            Route::post('/roles', [UserRBACController::class, 'assignRole'])
                ->name('users.roles.assign');
            Route::put('/roles', [UserRBACController::class, 'syncRoles'])
                ->name('users.roles.sync');
            Route::delete('/roles/{role}', [UserRBACController::class, 'removeRole'])
                ->name('users.roles.remove');

            // Grant/Revoke permissions
            Route::post('/permissions', [UserRBACController::class, 'givePermission'])
                ->name('users.permissions.give');
            Route::delete('/permissions/{permission}', [UserRBACController::class, 'revokePermission'])
                ->name('users.permissions.revoke');

            // Check permission/role
            Route::get('/check-permission/{permission}', [UserRBACController::class, 'checkPermission'])
                ->name('users.check.permission');
            Route::get('/check-role/{role}', [UserRBACController::class, 'checkRole'])
                ->name('users.check.role');
        });

        // ==================== AUDIT LOG ROUTES ====================
        Route::prefix('audit-logs')->group(function () {
            Route::get('/', [AuditLogController::class, 'index'])->name('audit-logs.index');
            Route::get('/statistics', [AuditLogController::class, 'statistics'])->name('audit-logs.statistics');
            Route::get('/actions', [AuditLogController::class, 'getActions'])->name('audit-logs.actions');
            Route::get('/export/csv', [AuditLogController::class, 'exportCSV'])->name('audit-logs.export.csv');
            Route::get('/user/{userId}', [AuditLogController::class, 'userActivity'])->name('audit-logs.user-activity');
            Route::get('/{id}', [AuditLogController::class, 'show'])->name('audit-logs.show');
            Route::post('/cleanup', [AuditLogController::class, 'cleanup'])->name('audit-logs.cleanup');
        });
    });
    
    // ==================== HEALTH CHECK ====================
    Route::get('/health', function () {
        return response()->json([
            'success' => true,
            'service' => 'auth-service',
            'status' => 'healthy',
            'timestamp' => now()->toIso8601String()
        ]);
    })->name('health');
});

