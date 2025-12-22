<?php

namespace App\Repositories;

use App\Models\Invoice;
use App\Models\Budget;
use App\Models\Expense;

class FinancialRepository
{
    public function getAllInvoices(int $perPage = 15, array $filters = [])
    {
        $query = Invoice::query();

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->latest('due_date')->paginate($perPage);
    }

    public function findInvoiceById(int $id): ?Invoice
    {
        return Invoice::find($id);
    }

    public function createInvoice(array $data): Invoice
    {
        return Invoice::create($data);
    }

    public function updateInvoice(int $id, array $data): bool
    {
        $invoice = $this->findInvoiceById($id);
        return $invoice ? $invoice->update($data) : false;
    }

    public function getAllBudgets(int $perPage = 15, array $filters = [])
    {
        $query = Budget::with('expenses');

        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        return $query->latest()->paginate($perPage);
    }

    public function findBudgetById(int $id): ?Budget
    {
        return Budget::with('expenses')->find($id);
    }

    public function createBudget(array $data): Budget
    {
        return Budget::create($data);
    }

    public function getAllExpenses(int $perPage = 15, array $filters = [])
    {
        $query = Expense::with('budget');

        if (!empty($filters['budget_id'])) {
            $query->where('budget_id', $filters['budget_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->latest('expense_date')->paginate($perPage);
    }

    public function createExpense(array $data): Expense
    {
        $expense = Expense::create($data);

        // Update budget spent amount
        if ($expense->budget_id && $expense->status === Expense::STATUS_APPROVED) {
            $budget = $this->findBudgetById($expense->budget_id);
            $budget->increment('spent_amount', $expense->amount);
        }

        return $expense;
    }

    public function approveExpense(int $id, int $approvedBy): bool
    {
        $expense = Expense::find($id);
        if (!$expense) return false;

        $expense->update([
            'status' => Expense::STATUS_APPROVED,
            'approved_by' => $approvedBy,
            'approved_at' => now()
        ]);

        // Update budget
        if ($expense->budget_id) {
            $budget = $this->findBudgetById($expense->budget_id);
            $budget->increment('spent_amount', $expense->amount);
        }

        return true;
    }

    public function getFinancialSummary(): array
    {
        return [
            'total_invoices' => Invoice::count(),
            'pending_invoices' => Invoice::pending()->count(),
            'overdue_invoices' => Invoice::overdue()->count(),
            'total_budgets' => Budget::count(),
            'active_budgets' => Budget::active()->count(),
            'total_expenses' => Expense::count(),
            'pending_expenses' => Expense::pending()->count(),
            'total_invoice_amount' => Invoice::sum('total') ?? 0,
            'total_budget_amount' => Budget::sum('allocated_amount') ?? 0,
            'total_spent_amount' => Budget::sum('spent_amount') ?? 0
        ];
    }
}
