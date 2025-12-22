<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Ticket;
use App\Models\TicketsStatus;
use App\Models\TicketsPriority;
use App\Models\TicketsType;
use App\Models\Location;
use App\Models\Division;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;

class TicketApiTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $user;
    protected $admin;
    protected $status;
    protected $priority;
    protected $type;
    protected $location;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test users
        $this->user = User::factory()->create([
            'username' => 'testuser',
            'email' => 'user@test.com',
        ]);

        $this->admin = User::factory()->create([
            'username' => 'adminuser',
            'email' => 'admin@test.com',
        ]);

        // Create master data
        $this->status = TicketsStatus::create([
            'status' => 'New',
            'color' => '#FFA500',
            'description' => 'New ticket',
        ]);

        $this->priority = TicketsPriority::create([
            'priority' => 'High',
            'sla_hours' => 4,
            'color' => '#FF0000',
            'description' => 'High priority',
        ]);

        $this->type = TicketsType::create([
            'type' => 'Bug',
            'description' => 'Bug report',
        ]);

        $this->location = Location::create([
            'name' => 'Jakarta Office',
            'address' => 'Jakarta',
        ]);
    }

    /**
     * Test health check endpoint
     */
    public function test_health_check_returns_success(): void
    {
        $response = $this->getJson('/api/health');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'service' => 'ticket-service',
                'status' => 'healthy',
            ]);
    }

    /**
     * Test get all tickets requires authentication
     */
    public function test_get_tickets_requires_authentication(): void
    {
        $response = $this->getJson('/api/v1/tickets');

        $response->assertStatus(401);
    }

    /**
     * Test get all tickets with authentication
     */
    public function test_get_tickets_with_authentication_returns_list(): void
    {
        Sanctum::actingAs($this->user);

        // Create test tickets
        Ticket::factory()->count(5)->create([
            'user_id' => $this->user->id,
            'ticket_status_id' => $this->status->id,
            'ticket_priority_id' => $this->priority->id,
            'ticket_type_id' => $this->type->id,
            'location_id' => $this->location->id,
        ]);

        $response = $this->getJson('/api/v1/tickets');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'ticket_code',
                            'subject',
                            'status_name',
                            'priority_name',
                        ]
                    ],
                    'meta'
                ],
                'message'
            ]);
    }

    /**
     * Test create ticket with valid data
     */
    public function test_create_ticket_with_valid_data_returns_created(): void
    {
        Sanctum::actingAs($this->user);

        $ticketData = [
            'subject' => 'Test ticket',
            'description' => 'This is a test ticket description',
            'ticket_priority_id' => $this->priority->id,
            'ticket_type_id' => $this->type->id,
            'location_id' => $this->location->id,
        ];

        $response = $this->postJson('/api/v1/tickets', $ticketData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'ticket_code',
                    'subject',
                    'description',
                    'status_name',
                    'priority_name',
                ],
                'message'
            ])
            ->assertJson([
                'success' => true,
                'data' => [
                    'subject' => 'Test ticket',
                ],
            ]);

        // Verify ticket exists in database
        $this->assertDatabaseHas('tickets', [
            'subject' => 'Test ticket',
            'user_id' => $this->user->id,
        ]);

        // Verify audit log created
        $this->assertDatabaseHas('audit_logs', [
            'auditable_type' => Ticket::class,
            'action' => 'created',
            'user_id' => $this->user->id,
        ]);
    }

    /**
     * Test create ticket with missing required fields
     */
    public function test_create_ticket_with_missing_fields_returns_validation_error(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/v1/tickets', [
            'description' => 'Missing subject',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['subject', 'ticket_type_id', 'ticket_priority_id']);
    }

    /**
     * Test create ticket auto-generates ticket code
     */
    public function test_create_ticket_auto_generates_ticket_code(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/v1/tickets', [
            'subject' => 'Test ticket code',
            'description' => 'Testing auto-generation',
            'ticket_priority_id' => $this->priority->id,
            'ticket_type_id' => $this->type->id,
            'location_id' => $this->location->id,
        ]);

        $response->assertStatus(201);

        $ticketCode = $response->json('data.ticket_code');
        $this->assertMatchesRegularExpression('/^TKT-\d{8}-\d{3}$/', $ticketCode);
    }

    /**
     * Test get single ticket by ID
     */
    public function test_get_single_ticket_returns_ticket_data(): void
    {
        Sanctum::actingAs($this->user);

        $ticket = Ticket::factory()->create([
            'user_id' => $this->user->id,
            'ticket_status_id' => $this->status->id,
            'ticket_priority_id' => $this->priority->id,
            'ticket_type_id' => $this->type->id,
            'location_id' => $this->location->id,
        ]);

        $response = $this->getJson("/api/v1/tickets/{$ticket->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $ticket->id,
                    'subject' => $ticket->subject,
                ],
            ]);
    }

    /**
     * Test get non-existent ticket returns 404
     */
    public function test_get_nonexistent_ticket_returns_not_found(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->getJson('/api/v1/tickets/99999');

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'error' => 'Ticket not found',
            ]);
    }

    /**
     * Test update ticket with valid data
     */
    public function test_update_ticket_with_valid_data_returns_updated(): void
    {
        Sanctum::actingAs($this->user);

        $ticket = Ticket::factory()->create([
            'user_id' => $this->user->id,
            'subject' => 'Original subject',
            'ticket_status_id' => $this->status->id,
            'ticket_priority_id' => $this->priority->id,
            'ticket_type_id' => $this->type->id,
            'location_id' => $this->location->id,
        ]);

        $response = $this->putJson("/api/v1/tickets/{$ticket->id}", [
            'subject' => 'Updated subject',
            'description' => 'Updated description',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'subject' => 'Updated subject',
                ],
            ]);

        // Verify database updated
        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
            'subject' => 'Updated subject',
        ]);

        // Verify ticket history logged
        $this->assertDatabaseHas('ticket_history', [
            'ticket_id' => $ticket->id,
            'field_changed' => 'subject',
            'old_value' => 'Original subject',
            'new_value' => 'Updated subject',
        ]);
    }

    /**
     * Test delete ticket (soft delete)
     */
    public function test_delete_ticket_soft_deletes_ticket(): void
    {
        Sanctum::actingAs($this->user);

        $ticket = Ticket::factory()->create([
            'user_id' => $this->user->id,
            'ticket_status_id' => $this->status->id,
            'ticket_priority_id' => $this->priority->id,
            'ticket_type_id' => $this->type->id,
            'location_id' => $this->location->id,
        ]);

        $response = $this->deleteJson("/api/v1/tickets/{$ticket->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Ticket deleted successfully',
            ]);

        // Verify soft deleted
        $this->assertSoftDeleted('tickets', [
            'id' => $ticket->id,
        ]);
    }

    /**
     * Test restore deleted ticket
     */
    public function test_restore_deleted_ticket_restores_successfully(): void
    {
        Sanctum::actingAs($this->user);

        $ticket = Ticket::factory()->create([
            'user_id' => $this->user->id,
            'ticket_status_id' => $this->status->id,
            'ticket_priority_id' => $this->priority->id,
            'ticket_type_id' => $this->type->id,
            'location_id' => $this->location->id,
        ]);

        // Delete ticket first
        $ticket->delete();

        // Restore
        $response = $this->postJson("/api/v1/tickets/{$ticket->id}/restore");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Ticket restored successfully',
            ]);

        // Verify restored
        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
            'deleted_at' => null,
        ]);
    }

    /**
     * Test assign ticket to user
     */
    public function test_assign_ticket_to_user_updates_assignment(): void
    {
        Sanctum::actingAs($this->admin);

        $ticket = Ticket::factory()->create([
            'user_id' => $this->user->id,
            'ticket_status_id' => $this->status->id,
            'ticket_priority_id' => $this->priority->id,
            'ticket_type_id' => $this->type->id,
            'location_id' => $this->location->id,
        ]);

        $response = $this->postJson("/api/v1/tickets/{$ticket->id}/assign", [
            'assigned_to' => $this->admin->id,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'assigned_to' => [
                        'id' => $this->admin->id,
                    ],
                ],
            ]);

        // Verify assignment in database
        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
            'assigned_to' => $this->admin->id,
        ]);
    }

    /**
     * Test add comment to ticket
     */
    public function test_add_comment_to_ticket_creates_comment(): void
    {
        Sanctum::actingAs($this->user);

        $ticket = Ticket::factory()->create([
            'user_id' => $this->user->id,
            'ticket_status_id' => $this->status->id,
            'ticket_priority_id' => $this->priority->id,
            'ticket_type_id' => $this->type->id,
            'location_id' => $this->location->id,
        ]);

        $response = $this->postJson("/api/v1/tickets/{$ticket->id}/comments", [
            'comment' => 'This is a test comment',
            'is_internal' => false,
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Comment added successfully',
            ]);

        // Verify comment in database
        $this->assertDatabaseHas('ticket_comments', [
            'ticket_id' => $ticket->id,
            'comment' => 'This is a test comment',
            'user_id' => $this->user->id,
        ]);
    }

    /**
     * Test change ticket status
     */
    public function test_change_ticket_status_updates_status(): void
    {
        Sanctum::actingAs($this->admin);

        $ticket = Ticket::factory()->create([
            'user_id' => $this->user->id,
            'ticket_status_id' => $this->status->id,
            'ticket_priority_id' => $this->priority->id,
            'ticket_type_id' => $this->type->id,
            'location_id' => $this->location->id,
        ]);

        $newStatus = TicketsStatus::create([
            'status' => 'In Progress',
            'color' => '#0000FF',
            'description' => 'Work in progress',
        ]);

        $response = $this->postJson("/api/v1/tickets/{$ticket->id}/status", [
            'ticket_status_id' => $newStatus->id,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'status' => [
                        'id' => $newStatus->id,
                    ],
                ],
            ]);

        // Verify status change logged
        $this->assertDatabaseHas('ticket_history', [
            'ticket_id' => $ticket->id,
            'field_changed' => 'ticket_status_id',
        ]);
    }

    /**
     * Test get ticket statistics
     */
    public function test_get_ticket_statistics_returns_summary(): void
    {
        Sanctum::actingAs($this->user);

        // Create tickets with different statuses
        Ticket::factory()->count(5)->create([
            'user_id' => $this->user->id,
            'ticket_status_id' => $this->status->id,
            'ticket_priority_id' => $this->priority->id,
            'ticket_type_id' => $this->type->id,
            'location_id' => $this->location->id,
        ]);

        $response = $this->getJson('/api/v1/tickets/stats/summary');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'total',
                    'open',
                    'closed',
                    'breached',
                    'unassigned',
                ],
            ]);
    }

    /**
     * Test filter tickets by status
     */
    public function test_filter_tickets_by_status_returns_filtered_list(): void
    {
        Sanctum::actingAs($this->user);

        $status1 = TicketsStatus::create([
            'status' => 'Status1',
            'color' => '#000000',
        ]);

        $status2 = TicketsStatus::create([
            'status' => 'Status2',
            'color' => '#FFFFFF',
        ]);

        // Create tickets with different statuses
        Ticket::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'ticket_status_id' => $status1->id,
            'ticket_priority_id' => $this->priority->id,
            'ticket_type_id' => $this->type->id,
            'location_id' => $this->location->id,
        ]);

        Ticket::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'ticket_status_id' => $status2->id,
            'ticket_priority_id' => $this->priority->id,
            'ticket_type_id' => $this->type->id,
            'location_id' => $this->location->id,
        ]);

        $response = $this->getJson("/api/v1/tickets?status_id={$status1->id}");

        $response->assertStatus(200);

        $data = $response->json('data.data');
        $this->assertCount(3, $data);
    }

    /**
     * Test search tickets by keyword
     */
    public function test_search_tickets_by_keyword_returns_matching_tickets(): void
    {
        Sanctum::actingAs($this->user);

        Ticket::factory()->create([
            'user_id' => $this->user->id,
            'subject' => 'Printer not working',
            'ticket_status_id' => $this->status->id,
            'ticket_priority_id' => $this->priority->id,
            'ticket_type_id' => $this->type->id,
            'location_id' => $this->location->id,
        ]);

        Ticket::factory()->create([
            'user_id' => $this->user->id,
            'subject' => 'Network issue',
            'ticket_status_id' => $this->status->id,
            'ticket_priority_id' => $this->priority->id,
            'ticket_type_id' => $this->type->id,
            'location_id' => $this->location->id,
        ]);

        $response = $this->getJson('/api/v1/tickets?search=printer');

        $response->assertStatus(200);

        $data = $response->json('data.data');
        $this->assertCount(1, $data);
        $this->assertEquals('Printer not working', $data[0]['subject']);
    }
}
