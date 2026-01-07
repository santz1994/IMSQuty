<?php

namespace App\Repositories;

use App\Models\Invoice;
use App\Models\Budget;
use App\Models\Expense;
use Shared\Repositories\BaseRepository;

/**
 * Financial Repository
 * Handles financial data including Invoices, Budgets, and Expenses
 * Extends BaseRepository for common CRUD operations
 */
class FinancialRepository extends BaseRepository
{
    /**
     * Specify the primary model class for this repository (Invoice)
     */
    protected function model(): string
    {
        return Invoice::class;
    }

    // ============================================================
    // INVOICE OPERATIONS
    // ============================================================

    /**
     * Get all invoices with pagination and filters
     */
    public function getAllInvoices(int $perPage = 15, array $filters = [])
    {
        $query = Invoice::query();

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_email', 'like', "%{$search}%");
            });
        }

        if (isset($filters['overdue']) && $filters['overdue']) {
            $query->overdue();
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
        return Invoice::where('id', $id)->update($data);
    }

    public function deleteInvoice(int $id): bool
    {
        $invoice = Invoice::find($id);
        return $invoice ? $invoice->delete() : false;
    }

    // ============================================================
    // BUDGET OPERATIONS
    // ============================================================

    /**
     * Get all budgets with pagination and filters
     */
    public function getAllBudgets(int $perPage = 15, array $filters = [])
    {
        $query = Budget::with('expenses');

        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
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

    public function updateBudget(int $id, array $data): bool
    {
        return Budget::where('id', $id)->update($data);
    }

    public function deleteBudget(int $id): bool
    {
        $budget = Budget::find($id);
        return $budget ? $budget->delete() : false;
    }

    // ============================================================
    // EXPENSE OPERATIONS
    // ============================================================

    /**
     * Get all expenses with pagination and filters
     */
    public function getAllExpenses(int $perPage = 15, array $filters = [])
    {
        $query = Expense::with('budget');

        if (!empty($filters['budget_id'])) {
            $query->where('budget_id', $filters['budget_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('vendor', 'like', "%{$search}%")
                  ->orWhere('receipt_number', 'like', "%{$search}%");
            });
        }

        return $query->latest('expense_date')->paginate($perPage);
    }

    public function findExpenseById(int $id): ?Expense
    {
        return Expense::with('budget')->find($id);
    }

    public function createExpense(array $data): Expense
    {
        $expense = Expense::create($data);

        // Update budget spent amount only if expense is approved
        if ($expense->budget_id && $expense->status === Expense::STATUS_APPROVED) {
            $budget = $this->findBudgetById($expense->budget_id);
            $budget->increment('spent_amount', $expense->amount);
        }

        return $expense;
    }

    public function updateExpense(int $id, array $data): bool
    {
        return Expense::where('id', $id)->update($data);
    }

    public function deleteExpense(int $id): bool
    {
        $expense = Expense::find($id);
        return $expense ? $expense->delete() : false;
    }

    public function approveExpense(int $id, int $approvedBy): ?Expense
    {
        $expense = Expense::find($id);
        if (!$expense || $expense->status !== Expense::STATUS_PENDING) {
            return null;
        }

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

        return $expense->fresh();
    }

    public function rejectExpense(int $id, string $reason): ?Expense
    {
        $expense = Expense::find($id);
        if (!$expense || $expense->status !== Expense::STATUS_PENDING) {
            return null;
        }

        $expense->update([
            'status' => Expense::STATUS_REJECTED,
            'notes' => $reason
        ]);

        return $expense->fresh();
    }

    // ============================================================
    // ANALYTICS & REPORTING
    // ============================================================

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
