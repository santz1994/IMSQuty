<?php

namespace Database\Seeders;

use App\Models\Invoice;
use App\Models\Budget;
use App\Models\Expense;
use Illuminate\Database\Seeder;

class FinancialSeeder extends Seeder
{
    public function run(): void
    {
        // Create invoices
        Invoice::factory()->count(10)->pending()->create();
        Invoice::factory()->count(5)->paid()->create();
        Invoice::factory()->count(2)->overdue()->create();

        // Create budgets
        $itBudget = Budget::factory()->create([
            'name' => 'IT Department Budget 2025',
            'category' => 'IT',
            'allocated_amount' => 50000000,
            'spent_amount' => 15000000
        ]);

        $hrBudget = Budget::factory()->create([
            'name' => 'HR Department Budget 2025',
            'category' => 'HR',
            'allocated_amount' => 30000000,
            'spent_amount' => 8000000
        ]);

        // Create expenses
        Expense::factory()->count(5)->approved()->create([
            'budget_id' => $itBudget->id
        ]);

        Expense::factory()->count(3)->pending()->create([
            'budget_id' => $itBudget->id
        ]);

        Expense::factory()->count(4)->approved()->create([
            'budget_id' => $hrBudget->id
        ]);

        Expense::factory()->count(2)->paid()->create([
            'budget_id' => $hrBudget->id
        ]);
    }
}
