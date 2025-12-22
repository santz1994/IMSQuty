<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\BookingService;
use App\Repositories\BookingRepository;
use App\Repositories\MeetingRoomRepository;
use App\Models\MeetingRoom;
use App\Models\MeetingRoomBooking;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BookingServiceTest extends TestCase
{
    use RefreshDatabase;

    private BookingService $bookingService;
    private MeetingRoom $room;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->bookingService = new BookingService(
            new BookingRepository(),
            new MeetingRoomRepository()
        );

        // Create a test meeting room
        $this->room = MeetingRoom::create([
            'name' => 'Conference Room A',
            'code' => 'CONF-A',
            'capacity' => 10,
            'status' => 'available',
        ]);
    }

    /** @test */
    public function it_creates_booking_successfully()
    {
        $user = \App\Models\User::factory()->create();
        
        $data = [
            'meeting_room_id' => $this->room->id,
            'user_id' => $user->id,
            'title' => 'Team Meeting',
            'start_time' => Carbon::now()->addHours(1),
            'end_time' => Carbon::now()->addHours(2),
            'attendees_count' => 5,
        ];

        $result = $this->bookingService->createBooking($data);

        $this->assertTrue($result['success']);
        $this->assertEquals('Booking created successfully', $result['message']);
        $this->assertInstanceOf(MeetingRoomBooking::class, $result['data']);
    }

    /** @test */
    public function it_fails_when_room_not_found()
    {
        $data = [
            'meeting_room_id' => 999,
            'user_id' => 1,
            'title' => 'Test',
            'start_time' => Carbon::now()->addHours(1),
            'end_time' => Carbon::now()->addHours(2),
            'attendees_count' => 5,
        ];

        $result = $this->bookingService->createBooking($data);

        $this->assertFalse($result['success']);
        $this->assertEquals('Meeting room not found', $result['message']);
    }

    /** @test */
    public function it_validates_start_time_before_end_time()
    {
        $user = \App\Models\User::factory()->create();
        
        $data = [
            'meeting_room_id' => $this->room->id,
            'user_id' => $user->id,
            'title' => 'Test',
            'start_time' => Carbon::now()->addHours(2),
            'end_time' => Carbon::now()->addHours(1),
            'attendees_count' => 5,
        ];

        $result = $this->bookingService->createBooking($data);

        $this->assertFalse($result['success']);
        $this->assertEquals('Start time must be before end time', $result['message']);
    }

    /** @test */
    public function it_prevents_booking_in_the_past()
    {
        $user = \App\Models\User::factory()->create();
        
        $data = [
            'meeting_room_id' => $this->room->id,
            'user_id' => $user->id,
            'title' => 'Test',
            'start_time' => Carbon::now()->subHours(2),
            'end_time' => Carbon::now()->subHours(1),
            'attendees_count' => 5,
        ];

        $result = $this->bookingService->createBooking($data);

        $this->assertFalse($result['success']);
        $this->assertEquals('Cannot book rooms in the past', $result['message']);
    }

    /** @test */
    public function it_enforces_maximum_duration_limit()
    {
        $user = \App\Models\User::factory()->create();
        
        $data = [
            'meeting_room_id' => $this->room->id,
            'user_id' => $user->id,
            'title' => 'Long Meeting',
            'start_time' => Carbon::now()->addHours(1),
            'end_time' => Carbon::now()->addHours(10), // 9 hours
            'attendees_count' => 5,
        ];

        $result = $this->bookingService->createBooking($data);

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('cannot exceed 8 hours', $result['message']);
    }

    /** @test */
    public function it_validates_room_capacity()
    {
        $user = \App\Models\User::factory()->create();
        
        $data = [
            'meeting_room_id' => $this->room->id,
            'user_id' => $user->id,
            'title' => 'Large Meeting',
            'start_time' => Carbon::now()->addHours(1),
            'end_time' => Carbon::now()->addHours(2),
            'attendees_count' => 20, // Exceeds capacity of 10
        ];

        $result = $this->bookingService->createBooking($data);

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('capacity', strtolower($result['message']));
    }

    /** @test */
    public function it_detects_booking_conflicts()
    {
        $user = \App\Models\User::factory()->create();
        
        // Create first booking
        MeetingRoomBooking::create([
            'meeting_room_id' => $this->room->id,
            'user_id' => $user->id,
            'title' => 'Existing Booking',
            'start_time' => Carbon::now()->addHours(1),
            'end_time' => Carbon::now()->addHours(2),
            'attendees_count' => 5,
            'status' => 'approved',
        ]);

        // Try to create conflicting booking
        $data = [
            'meeting_room_id' => $this->room->id,
            'user_id' => $user->id,
            'title' => 'Conflicting Booking',
            'start_time' => Carbon::now()->addHours(1)->addMinutes(30),
            'end_time' => Carbon::now()->addHours(2)->addMinutes(30),
            'attendees_count' => 5,
        ];

        $result = $this->bookingService->createBooking($data);

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('not available', $result['message']);
    }

    /** @test */
    public function it_approves_pending_booking()
    {
        $user = \App\Models\User::factory()->create();
        $approver = \App\Models\User::factory()->create();
        
        $booking = MeetingRoomBooking::create([
            'meeting_room_id' => $this->room->id,
            'user_id' => $user->id,
            'title' => 'Test Booking',
            'start_time' => Carbon::now()->addHours(1),
            'end_time' => Carbon::now()->addHours(2),
            'attendees_count' => 5,
            'status' => 'pending',
        ]);

        $result = $this->bookingService->approveBooking($booking->id, $approver->id);

        $this->assertTrue($result['success']);
        $this->assertEquals('approved', $result['data']->status);
    }

    /** @test */
    public function it_rejects_pending_booking_with_reason()
    {
        $user = \App\Models\User::factory()->create();
        $rejector = \App\Models\User::factory()->create();
        
        $booking = MeetingRoomBooking::create([
            'meeting_room_id' => $this->room->id,
            'user_id' => $user->id,
            'title' => 'Test Booking',
            'start_time' => Carbon::now()->addHours(1),
            'end_time' => Carbon::now()->addHours(2),
            'attendees_count' => 5,
            'status' => 'pending',
        ]);

        $reason = 'Room needed for emergency meeting';
        $result = $this->bookingService->rejectBooking($booking->id, $rejector->id, $reason);

        $this->assertTrue($result['success']);
        $this->assertEquals('rejected', $result['data']->status);
        $this->assertEquals($reason, $result['data']->rejection_reason);
    }

    /** @test */
    public function it_cancels_booking_with_reason()
    {
        $user = \App\Models\User::factory()->create();
        
        $booking = MeetingRoomBooking::create([
            'meeting_room_id' => $this->room->id,
            'user_id' => $user->id,
            'title' => 'Test Booking',
            'start_time' => Carbon::now()->addHours(1),
            'end_time' => Carbon::now()->addHours(2),
            'attendees_count' => 5,
            'status' => 'approved',
        ]);

        $reason = 'Meeting postponed';
        $result = $this->bookingService->cancelBooking($booking->id, $reason);

        $this->assertTrue($result['success']);
        $this->assertEquals('cancelled', $result['data']->status);
        $this->assertEquals($reason, $result['data']->cancellation_reason);
    }

    /** @test */
    public function it_prevents_approving_non_pending_bookings()
    {
        $user = \App\Models\User::factory()->create();
        $approver = \App\Models\User::factory()->create();
        
        $booking = MeetingRoomBooking::create([
            'meeting_room_id' => $this->room->id,
            'user_id' => $user->id,
            'title' => 'Test Booking',
            'start_time' => Carbon::now()->addHours(1),
            'end_time' => Carbon::now()->addHours(2),
            'attendees_count' => 5,
            'status' => 'approved',
        ]);

        $result = $this->bookingService->approveBooking($booking->id, $approver->id);

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('pending', strtolower($result['message']));
    }

    /** @test */
    public function it_updates_booking_successfully()
    {
        $user = \App\Models\User::factory()->create();
        
        $booking = MeetingRoomBooking::create([
            'meeting_room_id' => $this->room->id,
            'user_id' => $user->id,
            'title' => 'Original Title',
            'start_time' => Carbon::now()->addHours(1),
            'end_time' => Carbon::now()->addHours(2),
            'attendees_count' => 5,
            'status' => 'pending',
        ]);

        $updateData = [
            'title' => 'Updated Title',
            'attendees_count' => 8,
        ];

        $result = $this->bookingService->updateBooking($booking->id, $updateData);

        $this->assertTrue($result['success']);
        $this->assertEquals('Updated Title', $result['data']->title);
        $this->assertEquals(8, $result['data']->attendees_count);
    }

    /** @test */
    public function it_prevents_updating_completed_bookings()
    {
        $user = \App\Models\User::factory()->create();
        
        $booking = MeetingRoomBooking::create([
            'meeting_room_id' => $this->room->id,
            'user_id' => $user->id,
            'title' => 'Test Booking',
            'start_time' => Carbon::now()->subHours(2),
            'end_time' => Carbon::now()->subHours(1),
            'attendees_count' => 5,
            'status' => 'completed',
        ]);

        $result = $this->bookingService->updateBooking($booking->id, ['title' => 'New Title']);

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('Cannot update', $result['message']);
    }
}
