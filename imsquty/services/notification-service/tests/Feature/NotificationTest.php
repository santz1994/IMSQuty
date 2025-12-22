<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationTest extends TestCase
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
    public function it_can_list_notifications()
    {
        Notification::factory()->count(5)->create();

        $response = $this->getJson('/api/v1/notifications');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data' => [
                        '*' => ['id', 'title', 'message', 'type', 'channel', 'status']
                    ]
                ],
                'message'
            ]);
    }

    /** @test */
    public function it_can_create_notification()
    {
        $data = [
            'title' => 'Test Notification',
            'message' => 'This is a test message',
            'type' => 'Info',
            'channel' => 'Email',
            'priority' => 'Normal',
            'recipient_id' => $this->user->id
        ];

        $response = $this->postJson('/api/v1/notifications', $data);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'data' => ['id', 'title', 'message'],
                'message'
            ]);

        $this->assertDatabaseHas('notifications', [
            'title' => 'Test Notification',
            'type' => 'Info',
            'channel' => 'Email'
        ]);
    }

    /** @test */
    public function it_can_show_notification()
    {
        $notification = Notification::factory()->create();

        $response = $this->getJson("/api/v1/notifications/{$notification->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $notification->id,
                    'title' => $notification->title
                ]
            ]);
    }

    /** @test */
    public function it_can_update_notification()
    {
        $notification = Notification::factory()->create();

        $data = [
            'title' => 'Updated Title',
            'message' => 'Updated message'
        ];

        $response = $this->putJson("/api/v1/notifications/{$notification->id}", $data);

        $response->assertStatus(200);

        $this->assertDatabaseHas('notifications', [
            'id' => $notification->id,
            'title' => 'Updated Title'
        ]);
    }

    /** @test */
    public function it_can_delete_notification()
    {
        $notification = Notification::factory()->create();

        $response = $this->deleteJson("/api/v1/notifications/{$notification->id}");

        $response->assertStatus(200);

        $this->assertSoftDeleted('notifications', [
            'id' => $notification->id
        ]);
    }

    /** @test */
    public function it_can_send_notification()
    {
        $notification = Notification::factory()->create([
            'status' => 'Pending'
        ]);

        $response = $this->postJson("/api/v1/notifications/{$notification->id}/send");

        $response->assertStatus(200);

        $notification->refresh();
        $this->assertEquals('Sent', $notification->status);
    }

    /** @test */
    public function it_can_get_unread_notifications()
    {
        Notification::factory()->create(['is_read' => false]);
        Notification::factory()->create(['is_read' => true]);

        $response = $this->getJson('/api/v1/notifications/unread');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.data');
    }

    /** @test */
    public function it_can_mark_notification_as_read()
    {
        $notification = Notification::factory()->create(['is_read' => false]);

        $response = $this->postJson("/api/v1/notifications/{$notification->id}/read");

        $response->assertStatus(200);

        $notification->refresh();
        $this->assertTrue($notification->is_read);
    }

    /** @test */
    public function it_can_mark_all_as_read()
    {
        Notification::factory()->count(3)->create(['is_read' => false]);

        $response = $this->postJson('/api/v1/notifications/mark-all-read');

        $response->assertStatus(200);

        $this->assertEquals(0, Notification::where('is_read', false)->count());
    }

    /** @test */
    public function it_can_get_statistics()
    {
        Notification::factory()->create(['status' => 'Sent']);
        Notification::factory()->create(['status' => 'Pending']);
        Notification::factory()->create(['status' => 'Failed']);

        $response = $this->getJson('/api/v1/notifications/statistics');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => ['total_notifications', 'sent_count', 'pending_count', 'by_channel'],
                'message'
            ]);
    }

    /** @test */
    public function it_validates_required_fields()
    {
        $response = $this->postJson('/api/v1/notifications', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'message', 'type', 'channel']);
    }
}
