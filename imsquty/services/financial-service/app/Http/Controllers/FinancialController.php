<?php

namespace App\Http\Controllers;

use App\Services\FinancialService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FinancialController extends Controller
{
    public function __construct(private FinancialService $service) {}

    // Invoices
    public function invoices(Request $request): JsonResponse
    {
        $invoices = $this->service->getAllInvoices(
            $request->input('per_page', 15),
            $request->only(['status'])
        );

        return response()->json([
            'success' => true,
            'data' => $invoices,
            'message' => 'Invoices retrieved successfully'
        ]);
    }

    public function storeInvoice(Request $request): JsonResponse
    {
        $invoice = $this->service->createInvoice($request->all());

        return response()->json([
            'success' => true,
            'data' => $invoice,
            'message' => 'Invoice created successfully'
        ], 201);
    }

    // Budgets
    public function budgets(Request $request): JsonResponse
    {
        $budgets = $this->service->getAllBudgets(
            $request->input('per_page', 15),
            $request->only(['department', 'status'])
        );

        return response()->json([
            'success' => true,
            'data' => $budgets,
            'message' => 'Budgets retrieved successfully'
        ]);
    }

    public function storeBudget(Request $request): JsonResponse
    {
        $budget = $this->service->createBudget($request->all());

        return response()->json([
            'success' => true,
            'data' => $budget,
            'message' => 'Budget created successfully'
        ], 201);
    }

    // Expenses
    public function expenses(Request $request): JsonResponse
    {
        $expenses = $this->service->getAllExpenses(
            $request->input('per_page', 15),
            $request->only(['budget_id', 'status'])
        );

        return response()->json([
            'success' => true,
            'data' => $expenses,
            'message' => 'Expenses retrieved successfully'
        ]);
    }

    public function storeExpense(Request $request): JsonResponse
    {
        $expense = $this->service->createExpense($request->all());

        return response()->json([
            'success' => true,
            'data' => $expense,
            'message' => 'Expense created successfully'
        ], 201);
    }

    public function approveExpense(int $id, Request $request): JsonResponse
    {
        $approvedBy = $request->input('approved_by') ?? auth()->id() ?? 1;
        $result = $this->service->approveExpense($id, $approvedBy);

        return response()->json([
            'success' => $result,
            'message' => $result ? 'Expense approved' : 'Failed to approve'
        ], $result ? 200 : 400);
    }

    public function summary(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->service->getFinancialSummary(),
            'message' => 'Financial summary retrieved'
        ]);
    }
}
