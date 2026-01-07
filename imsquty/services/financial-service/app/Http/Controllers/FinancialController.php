<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateInvoiceRequest;
use App\Http\Requests\UpdateInvoiceRequest;
use App\Http\Requests\CreateBudgetRequest;
use App\Http\Requests\CreateExpenseRequest;
use App\Http\Resources\InvoiceResource;
use App\Http\Resources\BudgetResource;
use App\Http\Resources\ExpenseResource;
use App\Services\FinancialService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Shared\Traits\ApiResponses;

/**
 * Financial Controller
 * 
 * Handles all financial operations including invoices, budgets, and expenses
 */
class FinancialController extends Controller
{
    use ApiResponses;
    
    public function __construct(private FinancialService $service) {}

    // ==================== INVOICES ====================
    
    /**
     * List all invoices with filtering and pagination
     */
    public function invoices(Request $request): JsonResponse
    {
        $invoices = $this->service->getAllInvoices(
            $request->input('per_page', 15),
            $request->only(['status', 'search', 'overdue'])
        );
        
        return $this->paginatedResponse(
            [
                'data' => InvoiceResource::collection($invoices->items()),
                'current_page' => $invoices->currentPage(),
                'total' => $invoices->total(),
                'per_page' => $invoices->perPage(),
                'last_page' => $invoices->lastPage(),
            ],
            'Invoices retrieved successfully'
        );
    }

    /**
     * Get single invoice details
     */
    public function showInvoice(int $id): JsonResponse
    {
        $invoice = $this->service->getInvoiceById($id);
        
        if (!$invoice) {
            return $this->notFoundResponse('Invoice not found');
        }
        
        return $this->successResponse(
            new InvoiceResource($invoice),
            'Invoice retrieved successfully'
        );
    }

    /**
     * Create new invoice
     */
    public function storeInvoice(CreateInvoiceRequest $request): JsonResponse
    {
        $invoice = $this->service->createInvoice($request->validated());
        
        return $this->createdResponse(
            new InvoiceResource($invoice),
            'Invoice created successfully'
        );
    }

    /**
     * Update existing invoice
     */
    public function updateInvoice(UpdateInvoiceRequest $request, int $id): JsonResponse
    {
        $invoice = $this->service->updateInvoice($id, $request->validated());
        
        if (!$invoice) {
            return $this->notFoundResponse('Invoice not found');
        }
        
        return $this->successResponse(
            new InvoiceResource($invoice),
            'Invoice updated successfully'
        );
    }

    /**
     * Delete invoice (soft delete)
     */
    public function deleteInvoice(int $id): JsonResponse
    {
        $result = $this->service->deleteInvoice($id);
        
        if (!$result) {
            return $this->notFoundResponse('Invoice not found');
        }
        
        return $this->deletedResponse('Invoice deleted successfully');
    }

    /**
     * Mark invoice as paid
     */
    public function payInvoice(int $id, Request $request): JsonResponse
    {
        $invoice = $this->service->markInvoiceAsPaid($id, $request->input('paid_date'));
        
        if (!$invoice) {
            return $this->notFoundResponse('Invoice not found');
        }
        
        return $this->successResponse(
            new InvoiceResource($invoice),
            'Invoice marked as paid successfully'
        );
    }

    // ==================== BUDGETS ====================
    
    /**
     * List all budgets with filtering and pagination
     */
    public function budgets(Request $request): JsonResponse
    {
        $budgets = $this->service->getAllBudgets(
            $request->input('per_page', 15),
            $request->only(['category', 'is_active', 'search'])
        );
        
        return $this->paginatedResponse(
            [
                'data' => BudgetResource::collection($budgets->items()),
                'current_page' => $budgets->currentPage(),
                'total' => $budgets->total(),
                'per_page' => $budgets->perPage(),
                'last_page' => $budgets->lastPage(),
            ],
            'Budgets retrieved successfully'
        );
    }

    /**
     * Get single budget details with expenses
     */
    public function showBudget(int $id): JsonResponse
    {
        $budget = $this->service->getBudgetById($id);
        
        if (!$budget) {
            return $this->notFoundResponse('Budget not found');
        }
        
        return $this->successResponse(
            new BudgetResource($budget),
            'Budget retrieved successfully'
        );
    }

    /**
     * Create new budget
     */
    public function storeBudget(CreateBudgetRequest $request): JsonResponse
    {
        $budget = $this->service->createBudget($request->validated());
        
        return $this->createdResponse(
            new BudgetResource($budget),
            'Budget created successfully'
        );
    }

    /**
     * Update existing budget
     */
    public function updateBudget(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'allocated_amount' => 'sometimes|numeric|min:0',
            'period_start' => 'sometimes|date',
            'period_end' => 'sometimes|date|after:period_start',
            'is_active' => 'sometimes|boolean'
        ]);
        
        $budget = $this->service->updateBudget($id, $request->all());
        
        if (!$budget) {
            return $this->notFoundResponse('Budget not found');
        }
        
        return $this->successResponse(
            new BudgetResource($budget),
            'Budget updated successfully'
        );
    }

    /**
     * Delete budget (soft delete)
     */
    public function deleteBudget(int $id): JsonResponse
    {
        $result = $this->service->deleteBudget($id);
        
        if (!$result) {
            return $this->notFoundResponse('Budget not found');
        }
        
        return $this->deletedResponse('Budget deleted successfully');
    }

    /**
     * Get budget utilization report
     */
    public function budgetUtilization(int $id): JsonResponse
    {
        $report = $this->service->getBudgetUtilization($id);
        
        if (!$report) {
            return $this->notFoundResponse('Budget not found');
        }
        
        return $this->successResponse(
            $report,
            'Budget utilization retrieved successfully'
        );
    }

    // ==================== EXPENSES ====================
    
    /**
     * List all expenses with filtering and pagination
     */
    public function expenses(Request $request): JsonResponse
    {
        $expenses = $this->service->getAllExpenses(
            $request->input('per_page', 15),
            $request->only(['budget_id', 'status', 'category', 'search'])
        );
        
        return $this->paginatedResponse(
            [
                'data' => ExpenseResource::collection($expenses->items()),
                'current_page' => $expenses->currentPage(),
                'total' => $expenses->total(),
                'per_page' => $expenses->perPage(),
                'last_page' => $expenses->lastPage(),
            ],
            'Expenses retrieved successfully'
        );
    }

    /**
     * Get single expense details
     */
    public function showExpense(int $id): JsonResponse
    {
        $expense = $this->service->getExpenseById($id);
        
        if (!$expense) {
            return $this->notFoundResponse('Expense not found');
        }
        
        return $this->successResponse(
            new ExpenseResource($expense),
            'Expense retrieved successfully'
        );
    }

    /**
     * Create new expense
     */
    public function storeExpense(CreateExpenseRequest $request): JsonResponse
    {
        $expense = $this->service->createExpense($request->validated());
        
        if (!$expense) {
            return $this->errorResponse('Failed to create expense. Budget may be exceeded.', 400);
        }
        
        return $this->createdResponse(
            new ExpenseResource($expense),
            'Expense created successfully'
        );
    }

    /**
     * Update existing expense
     */
    public function updateExpense(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'category' => 'sometimes|string|max:100',
            'description' => 'sometimes|string|max:500',
            'amount' => 'sometimes|numeric|min:0',
            'expense_date' => 'sometimes|date',
            'vendor' => 'sometimes|string|max:255'
        ]);
        
        $expense = $this->service->updateExpense($id, $request->all());
        
        if (!$expense) {
            return $this->notFoundResponse('Expense not found');
        }
        
        return $this->successResponse(
            new ExpenseResource($expense),
            'Expense updated successfully'
        );
    }

    /**
     * Delete expense (soft delete)
     */
    public function deleteExpense(int $id): JsonResponse
    {
        $result = $this->service->deleteExpense($id);
        
        if (!$result) {
            return $this->notFoundResponse('Expense not found');
        }
        
        return $this->deletedResponse('Expense deleted successfully');
    }

    /**
     * Approve pending expense
     */
    public function approveExpense(int $id, Request $request): JsonResponse
    {
        $approvedBy = $request->input('approved_by') ?? auth()->id() ?? 1;
        $expense = $this->service->approveExpense($id, $approvedBy);
        
        if (!$expense) {
            return $this->notFoundResponse('Expense not found or already approved');
        }
        
        return $this->successResponse(
            new ExpenseResource($expense),
            'Expense approved successfully'
        );
    }

    /**
     * Reject pending expense
     */
    public function rejectExpense(int $id, Request $request): JsonResponse
    {
        $reason = $request->input('reason', 'No reason provided');
        $expense = $this->service->rejectExpense($id, $reason);
        
        if (!$expense) {
            return $this->notFoundResponse('Expense not found or already processed');
        }
        
        return $this->successResponse(
            new ExpenseResource($expense),
            'Expense rejected successfully'
        );
    }

    // ==================== REPORTS & SUMMARY ====================
    
    /**
     * Get comprehensive financial summary
     */
    public function summary(): JsonResponse
    {
        $data = $this->service->getFinancialSummary();
        
        return $this->successResponse(
            $data,
            'Financial summary retrieved successfully'
        );
    }

    /**
     * Get budget alerts (overbudget, near limit)
     */
    public function budgetAlerts(): JsonResponse
    {
        $alerts = $this->service->getBudgetAlerts();
        
        return $this->successResponse(
            $alerts,
            'Budget alerts retrieved successfully'
        );
    }

    /**
     * Get expense analytics by category
     */
    public function expenseAnalytics(Request $request): JsonResponse
    {
        $period = $request->input('period', 'month'); // month, quarter, year
        $analytics = $this->service->getExpenseAnalytics($period);
        
        return $this->successResponse(
            $analytics,
            'Expense analytics retrieved successfully'
        );
    }
}
