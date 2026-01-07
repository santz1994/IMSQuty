<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Budget;
use App\Models\Expense;
use App\Repositories\FinancialRepository;
use Illuminate\Support\Facades\DB;

/**
 * Financial Service
 * 
 * Business logic for financial operations
 */
class FinancialService
{
    public function __construct(private FinancialRepository $repository) {}

    // ==================== INVOICES ====================
    
    public function getAllInvoices(int $perPage = 15, array $filters = [])
    {
        return $this->repository->getAllInvoices($perPage, $filters);
    }

    public function getInvoiceById(int $id): ?Invoice
    {
        return $this->repository->findInvoiceById($id);
    }

    public function createInvoice(array $data): Invoice
    {
        // Auto-calculate total if not provided
        if (!isset($data['total'])) {
            $data['total'] = ($data['amount'] ?? 0) + ($data['tax'] ?? 0);
        }
        
        // Set default status
        if (!isset($data['status'])) {
            $data['status'] = Invoice::STATUS_PENDING;
        }
        
        // Set created_by
        $data['created_by'] = auth()->id() ?? 1;
        
        return $this->repository->createInvoice($data);
    }

    public function updateInvoice(int $id, array $data): ?Invoice
    {
        $invoice = $this->repository->findInvoiceById($id);
        
        if (!$invoice) {
            return null;
        }
        
        // Recalculate total if amount or tax changed
        if (isset($data['amount']) || isset($data['tax'])) {
            $amount = $data['amount'] ?? $invoice->amount;
            $tax = $data['tax'] ?? $invoice->tax;
            $data['total'] = $amount + $tax;
        }
        
        // Set updated_by
        $data['updated_by'] = auth()->id() ?? 1;
        
        // Check if invoice is overdue
        if ($invoice->status === Invoice::STATUS_PENDING && $invoice->due_date->isPast()) {
            $data['status'] = Invoice::STATUS_OVERDUE;
        }
        
        $this->repository->updateInvoice($id, $data);
        
        return $invoice->fresh();
    }

    public function deleteInvoice(int $id): bool
    {
        return $this->repository->deleteInvoice($id);
    }

    public function markInvoiceAsPaid(int $id, ?string $paidDate = null): ?Invoice
    {
        $invoice = $this->repository->findInvoiceById($id);
        
        if (!$invoice) {
            return null;
        }
        
        $this->repository->updateInvoice($id, [
            'status' => Invoice::STATUS_PAID,
            'paid_date' => $paidDate ?? now(),
            'updated_by' => auth()->id() ?? 1
        ]);
        
        return $invoice->fresh();
    }

    // ==================== BUDGETS ====================
    
    public function getAllBudgets(int $perPage = 15, array $filters = [])
    {
        return $this->repository->getAllBudgets($perPage, $filters);
    }

    public function getBudgetById(int $id): ?Budget
    {
        return $this->repository->findBudgetById($id);
    }

    public function createBudget(array $data): Budget
    {
        // Set defaults
        $data['spent_amount'] = 0;
        $data['is_active'] = $data['is_active'] ?? true;
        $data['created_by'] = auth()->id() ?? 1;
        
        return $this->repository->createBudget($data);
    }

    public function updateBudget(int $id, array $data): ?Budget
    {
        $budget = $this->repository->findBudgetById($id);
        
        if (!$budget) {
            return null;
        }
        
        $data['updated_by'] = auth()->id() ?? 1;
        
        $this->repository->updateBudget($id, $data);
        
        return $budget->fresh();
    }

    public function deleteBudget(int $id): bool
    {
        return $this->repository->deleteBudget($id);
    }

    public function getBudgetUtilization(int $id): ?array
    {
        $budget = $this->repository->findBudgetById($id);
        
        if (!$budget) {
            return null;
        }
        
        $remainingAmount = $budget->allocated_amount - $budget->spent_amount;
        $utilizationPercentage = $budget->utilization_percentage;
        
        return [
            'budget_id' => $budget->id,
            'budget_name' => $budget->name,
            'allocated_amount' => (float) $budget->allocated_amount,
            'spent_amount' => (float) $budget->spent_amount,
            'remaining_amount' => (float) $remainingAmount,
            'utilization_percentage' => round($utilizationPercentage, 2),
            'is_over_budget' => $utilizationPercentage > 100,
            'is_near_limit' => $utilizationPercentage >= 80 && $utilizationPercentage < 100,
            'expenses_count' => $budget->expenses->count(),
            'approved_expenses_count' => $budget->expenses->where('status', Expense::STATUS_APPROVED)->count(),
            'pending_expenses_count' => $budget->expenses->where('status', Expense::STATUS_PENDING)->count(),
        ];
    }

    // ==================== EXPENSES ====================
    
    public function getAllExpenses(int $perPage = 15, array $filters = [])
    {
        return $this->repository->getAllExpenses($perPage, $filters);
    }

    public function getExpenseById(int $id): ?Expense
    {
        return $this->repository->findExpenseById($id);
    }

    public function createExpense(array $data): ?Expense
    {
        // Check budget availability
        if (isset($data['budget_id'])) {
            $budget = $this->repository->findBudgetById($data['budget_id']);
            
            if (!$budget) {
                return null;
            }
            
            // Check if budget is active
            if (!$budget->is_active) {
                return null;
            }
            
            // Check if adding expense would exceed budget
            $newTotal = $budget->spent_amount + $data['amount'];
            if ($newTotal > $budget->allocated_amount * 1.1) { // Allow 10% overflow
                return null;
            }
        }
        
        // Set defaults
        $data['status'] = $data['status'] ?? Expense::STATUS_PENDING;
        $data['created_by'] = auth()->id() ?? 1;
        
        return $this->repository->createExpense($data);
    }

    public function updateExpense(int $id, array $data): ?Expense
    {
        $expense = $this->repository->findExpenseById($id);
        
        if (!$expense) {
            return null;
        }
        
        // If expense is already approved, check if amount change affects budget
        if ($expense->status === Expense::STATUS_APPROVED && isset($data['amount'])) {
            $budget = $expense->budget;
            $amountDifference = $data['amount'] - $expense->amount;
            
            // Adjust budget spent amount
            $budget->increment('spent_amount', $amountDifference);
        }
        
        $data['updated_by'] = auth()->id() ?? 1;
        
        $this->repository->updateExpense($id, $data);
        
        return $expense->fresh();
    }

    public function deleteExpense(int $id): bool
    {
        $expense = $this->repository->findExpenseById($id);
        
        if (!$expense) {
            return false;
        }
        
        // If expense was approved, decrease budget spent amount
        if ($expense->status === Expense::STATUS_APPROVED && $expense->budget_id) {
            $budget = $expense->budget;
            $budget->decrement('spent_amount', $expense->amount);
        }
        
        return $this->repository->deleteExpense($id);
    }

    public function approveExpense(int $id, int $approvedBy): ?Expense
    {
        return $this->repository->approveExpense($id, $approvedBy);
    }

    public function rejectExpense(int $id, string $reason): ?Expense
    {
        return $this->repository->rejectExpense($id, $reason);
    }

    // ==================== REPORTS & ANALYTICS ====================
    
    public function getFinancialSummary(): array
    {
        return $this->repository->getFinancialSummary();
    }

    public function getBudgetAlerts(): array
    {
        $budgets = Budget::active()->with('expenses')->get();
        
        $alerts = [
            'over_budget' => [],
            'near_limit' => [],
            'under_utilized' => []
        ];
        
        foreach ($budgets as $budget) {
            $utilization = $budget->utilization_percentage;
            
            if ($utilization > 100) {
                $alerts['over_budget'][] = [
                    'budget_id' => $budget->id,
                    'budget_name' => $budget->name,
                    'allocated' => (float) $budget->allocated_amount,
                    'spent' => (float) $budget->spent_amount,
                    'over_by' => (float) ($budget->spent_amount - $budget->allocated_amount),
                    'utilization_percentage' => round($utilization, 2)
                ];
            } elseif ($utilization >= 80) {
                $alerts['near_limit'][] = [
                    'budget_id' => $budget->id,
                    'budget_name' => $budget->name,
                    'allocated' => (float) $budget->allocated_amount,
                    'spent' => (float) $budget->spent_amount,
                    'remaining' => (float) ($budget->allocated_amount - $budget->spent_amount),
                    'utilization_percentage' => round($utilization, 2)
                ];
            } elseif ($utilization < 50 && $budget->period_end->isPast()) {
                $alerts['under_utilized'][] = [
                    'budget_id' => $budget->id,
                    'budget_name' => $budget->name,
                    'allocated' => (float) $budget->allocated_amount,
                    'spent' => (float) $budget->spent_amount,
                    'utilization_percentage' => round($utilization, 2)
                ];
            }
        }
        
        return $alerts;
    }

    public function getExpenseAnalytics(string $period = 'month'): array
    {
        $startDate = match($period) {
            'month' => now()->startOfMonth(),
            'quarter' => now()->startOfQuarter(),
            'year' => now()->startOfYear(),
            default => now()->startOfMonth()
        };
        
        $endDate = now();
        
        $expenses = Expense::whereBetween('expense_date', [$startDate, $endDate])
            ->where('status', Expense::STATUS_APPROVED)
            ->get();
        
        $byCategory = $expenses->groupBy('category')->map(function($group) {
            return [
                'total_amount' => (float) $group->sum('amount'),
                'count' => $group->count(),
                'average_amount' => (float) $group->avg('amount')
            ];
        });
        
        return [
            'period' => $period,
            'start_date' => $startDate->toIso8601String(),
            'end_date' => $endDate->toIso8601String(),
            'total_expenses' => $expenses->count(),
            'total_amount' => (float) $expenses->sum('amount'),
            'average_expense' => (float) $expenses->avg('amount'),
            'by_category' => $byCategory,
            'top_vendors' => $expenses->groupBy('vendor')
                ->map(fn($group) => $group->sum('amount'))
                ->sortDesc()
                ->take(5)
                ->toArray()
        ];
    }
}
