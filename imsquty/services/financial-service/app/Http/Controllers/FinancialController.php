<?php

namespace App\Http\Controllers;

use App\Services\FinancialService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Shared\Traits\ApiResponses;

class FinancialController extends Controller
{
    use ApiResponses;
    public function __construct(private FinancialService $service) {}

    // Invoices
    public function invoices(Request $request): JsonResponse
    {
        $invoices = $this->service->getAllInvoices(
            $request->input('per_page', 15),
            $request->only(['status'])
        );
        return $this->paginatedResponse($invoices, 'Invoices retrieved successfully');
    }

    public function storeInvoice(Request $request): JsonResponse
    {
        $invoice = $this->service->createInvoice($request->all());
        return $this->createdResponse($invoice, 'Invoice created successfully');
    }

    // Budgets
    public function budgets(Request $request): JsonResponse
    {
        $budgets = $this->service->getAllBudgets(
            $request->input('per_page', 15),
            $request->only(['department', 'status'])
        );
        return $this->paginatedResponse($budgets, 'Budgets retrieved successfully');
    }

    public function storeBudget(Request $request): JsonResponse
    {
        $budget = $this->service->createBudget($request->all());
        return $this->createdResponse($budget, 'Budget created successfully');
    }

    // Expenses
    public function expenses(Request $request): JsonResponse
    {
        $expenses = $this->service->getAllExpenses(
            $request->input('per_page', 15),
            $request->only(['budget_id', 'status'])
        );
        return $this->paginatedResponse($expenses, 'Expenses retrieved successfully');
    }

    public function storeExpense(Request $request): JsonResponse
    {
        $expense = $this->service->createExpense($request->all());
        return $this->createdResponse($expense, 'Expense created successfully');
    }

    public function approveExpense(int $id, Request $request): JsonResponse
    {
        $approvedBy = $request->input('approved_by') ?? auth()->id() ?? 1;
        $result = $this->service->approveExpense($id, $approvedBy);
        return $result 
            ? $this->successResponse(null, 'Expense approved')
            : $this->errorResponse('Failed to approve expense', 400);
    }

    public function summary(): JsonResponse
    {
        $data = $this->service->getFinancialSummary();
        return $this->successResponse($data, 'Financial summary retrieved');
    }
}
