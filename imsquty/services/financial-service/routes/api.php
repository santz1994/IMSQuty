<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FinancialController;

Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    // Invoice Management (6 endpoints)
    Route::get('/invoices', [FinancialController::class, 'invoices']);
    Route::get('/invoices/{invoice}', [FinancialController::class, 'showInvoice']);
    Route::post('/invoices', [FinancialController::class, 'storeInvoice']);
    Route::put('/invoices/{invoice}', [FinancialController::class, 'updateInvoice']);
    Route::delete('/invoices/{invoice}', [FinancialController::class, 'deleteInvoice']);
    Route::post('/invoices/{invoice}/pay', [FinancialController::class, 'payInvoice']);
    
    // Budget Management (6 endpoints)
    Route::get('/budgets', [FinancialController::class, 'budgets']);
    Route::get('/budgets/{budget}', [FinancialController::class, 'showBudget']);
    Route::post('/budgets', [FinancialController::class, 'storeBudget']);
    Route::put('/budgets/{budget}', [FinancialController::class, 'updateBudget']);
    Route::delete('/budgets/{budget}', [FinancialController::class, 'deleteBudget']);
    Route::get('/budgets/{budget}/utilization', [FinancialController::class, 'budgetUtilization']);
    
    // Expense Management (7 endpoints)
    Route::get('/expenses', [FinancialController::class, 'expenses']);
    Route::get('/expenses/{expense}', [FinancialController::class, 'showExpense']);
    Route::post('/expenses', [FinancialController::class, 'storeExpense']);
    Route::put('/expenses/{expense}', [FinancialController::class, 'updateExpense']);
    Route::delete('/expenses/{expense}', [FinancialController::class, 'deleteExpense']);
    Route::post('/expenses/{expense}/approve', [FinancialController::class, 'approveExpense']);
    Route::post('/expenses/{expense}/reject', [FinancialController::class, 'rejectExpense']);
    
    // Financial Reports (3 endpoints)
    Route::get('/financial-summary', [FinancialController::class, 'summary']);
    Route::get('/budget-alerts', [FinancialController::class, 'budgetAlerts']);
    Route::get('/expense-analytics', [FinancialController::class, 'expenseAnalytics']);
    
    // Health Check
    Route::get('/health', fn() => response()->json([
        'status' => 'healthy',
        'service' => 'financial-service',
        'timestamp' => now()->toISOString()
    ]));
});
