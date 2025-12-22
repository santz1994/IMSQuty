<?php

namespace Tests\Feature;

use App\Models\Report;
use App\Models\ReportSchedule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportTest extends TestCase
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
    public function it_can_list_reports()
    {
        Report::factory()->count(5)->create();

        $response = $this->getJson('/api/v1/reports');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data' => [
                        '*' => ['id', 'name', 'type', 'status', 'format']
                    ]
                ],
                'message'
            ]);
    }

    /** @test */
    public function it_can_show_report()
    {
        $report = Report::factory()->create();

        $response = $this->getJson("/api/v1/reports/{$report->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $report->id,
                    'name' => $report->name
                ]
            ]);
    }

    /** @test */
    public function it_can_generate_report()
    {
        $data = [
            'name' => 'Asset Report',
            'type' => 'Asset',
            'format' => 'PDF',
            'parameters' => [
                'date_from' => now()->subMonth()->toDateString(),
                'date_to' => now()->toDateString()
            ]
        ];

        $response = $this->postJson('/api/v1/reports/generate', $data);

        $response->assertStatus(201);

        $this->assertDatabaseHas('reports', [
            'name' => 'Asset Report',
            'type' => 'Asset',
            'status' => 'Pending'
        ]);
    }

    /** @test */
    public function it_can_get_statistics()
    {
        Report::factory()->count(5)->completed()->create();
        Report::factory()->count(2)->pending()->create();
        Report::factory()->count(1)->failed()->create();

        $response = $this->getJson('/api/v1/reports/statistics');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'total_reports',
                    'completed_reports',
                    'pending_reports',
                    'by_type'
                ],
                'message'
            ]);
    }

    /** @test */
    public function it_can_list_schedules()
    {
        ReportSchedule::factory()->count(3)->create();

        $response = $this->getJson('/api/v1/schedules');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data' => [
                        '*' => ['id', 'name', 'report_type', 'frequency', 'is_active']
                    ]
                ],
                'message'
            ]);
    }

    /** @test */
    public function it_can_create_schedule()
    {
        $data = [
            'name' => 'Weekly Asset Report',
            'report_type' => 'Asset',
            'frequency' => 'Weekly',
            'format' => 'PDF',
            'parameters' => ['include_all' => true],
            'recipients' => ['admin@example.com'],
            'is_active' => true,
            'next_run_at' => now()->addWeek()->toDateTimeString()
        ];

        $response = $this->postJson('/api/v1/schedules', $data);

        $response->assertStatus(201);

        $this->assertDatabaseHas('report_schedules', [
            'name' => 'Weekly Asset Report',
            'frequency' => 'Weekly'
        ]);
    }

    /** @test */
    public function it_can_process_due_schedules()
    {
        ReportSchedule::factory()->count(3)->dueForExecution()->create();

        $response = $this->postJson('/api/v1/schedules/process-due');

        $response->assertStatus(200)
            ->assertJsonPath('data.processed', 3);
    }

    /** @test */
    public function it_filters_reports_by_type()
    {
        Report::factory()->create(['type' => 'Asset']);
        Report::factory()->create(['type' => 'Ticket']);

        $response = $this->getJson('/api/v1/reports?type=Asset');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.data');
    }

    /** @test */
    public function it_filters_reports_by_status()
    {
        Report::factory()->completed()->create();
        Report::factory()->pending()->create();

        $response = $this->getJson('/api/v1/reports?status=Completed');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.data');
    }
}
