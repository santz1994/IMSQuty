<?php

namespace Tests\Feature;

use App\Models\Invoice;
use App\Models\Budget;
use App\Models\Expense;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FinancialTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
    }

    /** @test */
    public function it_can_list_invoices()
    {
        Invoice::factory()->count(5)->create();

        $response = $this->getJson('/api/v1/invoices');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data' => [
                        '*' => ['id', 'invoice_number', 'customer_name', 'amount', 'status']
                    ]
                ],
                'message'
            ]);
    }

    /** @test */
    public function it_can_create_invoice()
    {
        $data = [
            'invoice_number' => 'INV-001',
            'customer_name' => 'Test Customer',
            'customer_email' => 'test@example.com',
            'amount' => 1000000,
            'tax' => 100000,
            'total' => 1100000,
            'due_date' => now()->addDays(30)->toDateString(),
            'status' => 'Pending'
        ];

        $response = $this->postJson('/api/v1/invoices', $data);

        $response->assertStatus(201);

        $this->assertDatabaseHas('invoices', [
            'invoice_number' => 'INV-001',
            'customer_name' => 'Test Customer'
        ]);
    }

    /** @test */
    public function it_can_list_budgets()
    {
        Budget::factory()->count(3)->create();

        $response = $this->getJson('/api/v1/budgets');

        $response->assertStatus(200);
    }

    /** @test */
    public function it_can_create_budget()
    {
        $data = [
            'name' => 'IT Budget 2025',
            'category' => 'IT',
            'allocated_amount' => 50000000,
            'spent_amount' => 0,
            'period_start' => now()->startOfYear()->toDateString(),
            'period_end' => now()->endOfYear()->toDateString()
        ];

        $response = $this->postJson('/api/v1/budgets', $data);

        $response->assertStatus(201);

        $this->assertDatabaseHas('budgets', [
            'name' => 'IT Budget 2025',
            'category' => 'IT'
        ]);
    }

    /** @test */
    public function it_can_list_expenses()
    {
        Expense::factory()->count(5)->create();

        $response = $this->getJson('/api/v1/expenses');

        $response->assertStatus(200);
    }

    /** @test */
    public function it_can_create_expense()
    {
        $budget = Budget::factory()->create();

        $data = [
            'budget_id' => $budget->id,
            'description' => 'Office supplies',
            'category' => 'Supplies',
            'amount' => 500000,
            'expense_date' => now()->toDateString(),
            'status' => 'Pending'
        ];

        $response = $this->postJson('/api/v1/expenses', $data);

        $response->assertStatus(201);

        $this->assertDatabaseHas('expenses', [
            'description' => 'Office supplies',
            'amount' => 500000
        ]);
    }

    /** @test */
    public function it_can_approve_expense()
    {
        $budget = Budget::factory()->create([
            'allocated_amount' => 10000000,
            'spent_amount' => 0
        ]);

        $expense = Expense::factory()->create([
            'budget_id' => $budget->id,
            'amount' => 500000,
            'status' => 'Pending'
        ]);

        $response = $this->postJson("/api/v1/expenses/{$expense->id}/approve");

        $response->assertStatus(200);

        $expense->refresh();
        $this->assertEquals('Approved', $expense->status);

        $budget->refresh();
        $this->assertEquals(500000, $budget->spent_amount);
    }

    /** @test */
    public function it_can_get_financial_summary()
    {
        Invoice::factory()->count(3)->create(['amount' => 1000000]);
        Budget::factory()->count(2)->create(['allocated_amount' => 5000000]);
        Expense::factory()->count(4)->create(['amount' => 200000]);

        $response = $this->getJson('/api/v1/financial-summary');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'total_invoices',
                    'total_budgets',
                    'total_expenses',
                    'pending_invoices'
                ],
                'message'
            ]);
    }

    /** @test */
    public function it_detects_overdue_invoices()
    {
        $overdue = Invoice::factory()->create([
            'due_date' => now()->subDays(5),
            'status' => 'Pending'
        ]);

        $this->assertTrue($overdue->isOverdue());
    }

    /** @test */
    public function it_calculates_budget_utilization()
    {
        $budget = Budget::factory()->create([
            'allocated_amount' => 10000000,
            'spent_amount' => 3000000
        ]);

        $this->assertEquals(30, $budget->utilization_percentage);
    }
}
