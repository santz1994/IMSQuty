<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\MeetingRoom;
use App\Models\MeetingRoomBooking;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Carbon\Carbon;

class BookingControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private MeetingRoom $room;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->room = MeetingRoom::factory()->create([
            'status' => 'available',
            'capacity' => 50,
        ]);
    }

    /** @test */
    public function it_requires_authentication_for_all_booking_endpoints()
    {
        $response = $this->getJson('/api/v1/bookings');
        $response->assertStatus(401);

        $response = $this->postJson('/api/v1/bookings', []);
        $response->assertStatus(401);
    }

    /** @test */
    public function it_returns_list_of_bookings()
    {
        Sanctum::actingAs($this->user);
        
        MeetingRoomBooking::factory()->count(3)->create([
            'meeting_room_id' => $this->room->id,
            'user_id' => $this->user->id,
        ]);

        $response = $this->getJson('/api/v1/bookings');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => ['id', 'title', 'start_time', 'end_time', 'status']
                ],
                'meta'
            ]);
    }

    /** @test */
    public function it_creates_booking_successfully()
    {
        Sanctum::actingAs($this->user);

        $data = [
            'meeting_room_id' => $this->room->id,
            'title' => 'Team Meeting',
            'start_time' => Carbon::now()->addHours(1)->toISOString(),
            'end_time' => Carbon::now()->addHours(2)->toISOString(),
            'attendees_count' => 5,
        ];

        $response = $this->postJson('/api/v1/bookings', $data);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Booking created successfully'
            ]);

        $this->assertDatabaseHas('meeting_room_bookings', [
            'meeting_room_id' => $this->room->id,
            'user_id' => $this->user->id,
            'title' => 'Team Meeting',
        ]);
    }

    /** @test */
    public function it_validates_required_booking_fields()
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/v1/bookings', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'meeting_room_id',
                'title',
                'start_time',
                'end_time',
                'attendees_count'
            ]);
    }

    /** @test */
    public function it_validates_start_time_is_in_future()
    {
        Sanctum::actingAs($this->user);

        $data = [
            'meeting_room_id' => $this->room->id,
            'title' => 'Past Meeting',
            'start_time' => Carbon::now()->subHours(1)->toISOString(),
            'end_time' => Carbon::now()->toISOString(),
            'attendees_count' => 5,
        ];

        $response = $this->postJson('/api/v1/bookings', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['start_time']);
    }

    /** @test */
    public function it_validates_end_time_after_start_time()
    {
        Sanctum::actingAs($this->user);

        $data = [
            'meeting_room_id' => $this->room->id,
            'title' => 'Invalid Time',
            'start_time' => Carbon::now()->addHours(2)->toISOString(),
            'end_time' => Carbon::now()->addHours(1)->toISOString(),
            'attendees_count' => 5,
        ];

        $response = $this->postJson('/api/v1/bookings', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['end_time']);
    }

    /** @test */
    public function it_prevents_booking_conflicts()
    {
        Sanctum::actingAs($this->user);

        // Create existing booking
        MeetingRoomBooking::factory()->create([
            'meeting_room_id' => $this->room->id,
            'user_id' => $this->user->id,
            'start_time' => Carbon::now()->addHours(1),
            'end_time' => Carbon::now()->addHours(2),
            'status' => 'approved',
        ]);

        // Try overlapping booking
        $data = [
            'meeting_room_id' => $this->room->id,
            'title' => 'Conflicting Meeting',
            'start_time' => Carbon::now()->addHours(1)->addMinutes(30)->toISOString(),
            'end_time' => Carbon::now()->addHours(2)->addMinutes(30)->toISOString(),
            'attendees_count' => 5,
        ];

        $response = $this->postJson('/api/v1/bookings', $data);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
            ]);
    }

    /** @test */
    public function it_returns_single_booking()
    {
        Sanctum::actingAs($this->user);

        $booking = MeetingRoomBooking::factory()->create([
            'meeting_room_id' => $this->room->id,
            'user_id' => $this->user->id,
        ]);

        $response = $this->getJson("/api/v1/bookings/{$booking->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $booking->id,
                    'title' => $booking->title,
                ]
            ]);
    }

    /** @test */
    public function it_updates_booking()
    {
        Sanctum::actingAs($this->user);

        $booking = MeetingRoomBooking::factory()->create([
            'meeting_room_id' => $this->room->id,
            'user_id' => $this->user->id,
            'status' => 'pending',
        ]);

        $updateData = [
            'title' => 'Updated Meeting Title',
            'attendees_count' => 10,
        ];

        $response = $this->putJson("/api/v1/bookings/{$booking->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('meeting_room_bookings', [
            'id' => $booking->id,
            'title' => 'Updated Meeting Title',
            'attendees_count' => 10,
        ]);
    }

    /** @test */
    public function it_deletes_booking()
    {
        Sanctum::actingAs($this->user);

        $booking = MeetingRoomBooking::factory()->create([
            'meeting_room_id' => $this->room->id,
            'user_id' => $this->user->id,
        ]);

        $response = $this->deleteJson("/api/v1/bookings/{$booking->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertSoftDeleted('meeting_room_bookings', ['id' => $booking->id]);
    }

    /** @test */
    public function it_approves_pending_booking()
    {
        Sanctum::actingAs($this->user);

        $booking = MeetingRoomBooking::factory()->create([
            'meeting_room_id' => $this->room->id,
            'user_id' => $this->user->id,
            'status' => 'pending',
        ]);

        $response = $this->postJson("/api/v1/bookings/{$booking->id}/approve");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Booking approved successfully'
            ]);

        $this->assertDatabaseHas('meeting_room_bookings', [
            'id' => $booking->id,
            'status' => 'approved',
        ]);
    }

    /** @test */
    public function it_rejects_pending_booking_with_reason()
    {
        Sanctum::actingAs($this->user);

        $booking = MeetingRoomBooking::factory()->create([
            'meeting_room_id' => $this->room->id,
            'user_id' => $this->user->id,
            'status' => 'pending',
        ]);

        $data = [
            'rejection_reason' => 'Room needed for urgent meeting'
        ];

        $response = $this->postJson("/api/v1/bookings/{$booking->id}/reject", $data);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Booking rejected successfully'
            ]);

        $this->assertDatabaseHas('meeting_room_bookings', [
            'id' => $booking->id,
            'status' => 'rejected',
            'rejection_reason' => 'Room needed for urgent meeting',
        ]);
    }

    /** @test */
    public function it_requires_rejection_reason()
    {
        Sanctum::actingAs($this->user);

        $booking = MeetingRoomBooking::factory()->create([
            'meeting_room_id' => $this->room->id,
            'user_id' => $this->user->id,
            'status' => 'pending',
        ]);

        $response = $this->postJson("/api/v1/bookings/{$booking->id}/reject", []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['rejection_reason']);
    }

    /** @test */
    public function it_cancels_booking_with_reason()
    {
        Sanctum::actingAs($this->user);

        $booking = MeetingRoomBooking::factory()->create([
            'meeting_room_id' => $this->room->id,
            'user_id' => $this->user->id,
            'status' => 'approved',
            'start_time' => Carbon::now()->addHours(1),
            'end_time' => Carbon::now()->addHours(2),
        ]);

        $data = [
            'cancellation_reason' => 'Meeting postponed'
        ];

        $response = $this->postJson("/api/v1/bookings/{$booking->id}/cancel", $data);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('meeting_room_bookings', [
            'id' => $booking->id,
            'status' => 'cancelled',
        ]);
    }

    /** @test */
    public function it_returns_user_bookings()
    {
        Sanctum::actingAs($this->user);

        MeetingRoomBooking::factory()->count(2)->create([
            'meeting_room_id' => $this->room->id,
            'user_id' => $this->user->id,
        ]);

        // Create booking for another user
        $otherUser = User::factory()->create();
        MeetingRoomBooking::factory()->create([
            'meeting_room_id' => $this->room->id,
            'user_id' => $otherUser->id,
        ]);

        $response = $this->getJson('/api/v1/bookings/my/bookings');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
                'count'
            ]);

        $this->assertCount(2, $response->json('data'));
    }

    /** @test */
    public function it_returns_todays_bookings()
    {
        Sanctum::actingAs($this->user);

        MeetingRoomBooking::factory()->create([
            'meeting_room_id' => $this->room->id,
            'user_id' => $this->user->id,
            'start_time' => Carbon::today()->addHours(10),
            'end_time' => Carbon::today()->addHours(11),
        ]);

        MeetingRoomBooking::factory()->create([
            'meeting_room_id' => $this->room->id,
            'user_id' => $this->user->id,
            'start_time' => Carbon::tomorrow()->addHours(10),
            'end_time' => Carbon::tomorrow()->addHours(11),
        ]);

        $response = $this->getJson('/api/v1/bookings/query/today');

        $response->assertStatus(200);
        
        $this->assertCount(1, $response->json('data'));
    }

    /** @test */
    public function it_returns_upcoming_bookings()
    {
        Sanctum::actingAs($this->user);

        MeetingRoomBooking::factory()->count(2)->create([
            'meeting_room_id' => $this->room->id,
            'user_id' => $this->user->id,
            'start_time' => Carbon::now()->addDays(2),
            'end_time' => Carbon::now()->addDays(2)->addHours(1),
            'status' => 'approved',
        ]);

        $response = $this->getJson('/api/v1/bookings/query/upcoming?days=7');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
                'count'
            ]);
    }

    /** @test */
    public function it_returns_booking_statistics()
    {
        Sanctum::actingAs($this->user);

        MeetingRoomBooking::factory()->create([
            'meeting_room_id' => $this->room->id,
            'user_id' => $this->user->id,
            'status' => 'pending',
        ]);

        MeetingRoomBooking::factory()->create([
            'meeting_room_id' => $this->room->id,
            'user_id' => $this->user->id,
            'status' => 'approved',
        ]);

        $response = $this->getJson('/api/v1/bookings/query/statistics');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'total_bookings',
                    'pending_bookings',
                    'approved_bookings',
                    'completed_bookings',
                    'cancelled_bookings',
                ]
            ]);
    }
}
