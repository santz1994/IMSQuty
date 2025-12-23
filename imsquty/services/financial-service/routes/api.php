<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FinancialController;

Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    // Invoices
    Route::get('/invoices', [FinancialController::class, 'invoices']);
    Route::post('/invoices', [FinancialController::class, 'storeInvoice']);
    
    // Budgets
    Route::get('/budgets', [FinancialController::class, 'budgets']);
    Route::post('/budgets', [FinancialController::class, 'storeBudget']);
    
    // Expenses
    Route::get('/expenses', [FinancialController::class, 'expenses']);
    Route::post('/expenses', [FinancialController::class, 'storeExpense']);
    Route::post('/expenses/{id}/approve', [FinancialController::class, 'approveExpense']);
    
    // Summary
    Route::get('/financial-summary', [FinancialController::class, 'summary']);
    
    Route::get('/health', fn() => response()->json([
        'status' => 'healthy',
        'service' => 'financial-service',
        'timestamp' => now()->toISOString()
    ]));
});
