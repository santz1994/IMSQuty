<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\MeetingRoom;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

class MeetingRoomControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    /** @test */
    public function it_returns_list_of_meeting_rooms()
    {
        MeetingRoom::factory()->count(3)->create();

        $response = $this->getJson('/api/v1/meeting-rooms');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => ['id', 'name', 'code', 'capacity', 'status']
                ],
                'meta' => ['current_page', 'per_page', 'total', 'last_page']
            ]);
    }

    /** @test */
    public function it_returns_single_meeting_room()
    {
        $room = MeetingRoom::factory()->create();

        $response = $this->getJson("/api/v1/meeting-rooms/{$room->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $room->id,
                    'name' => $room->name,
                ]
            ]);
    }

    /** @test */
    public function it_returns_404_for_non_existent_room()
    {
        $response = $this->getJson('/api/v1/meeting-rooms/999');

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'Meeting room not found'
            ]);
    }

    /** @test */
    public function it_creates_meeting_room_with_authentication()
    {
        Sanctum::actingAs($this->user);

        $data = [
            'name' => 'Conference Room B',
            'code' => 'CONF-B',
            'capacity' => 15,
            'status' => 'available',
        ];

        $response = $this->postJson('/api/v1/meeting-rooms', $data);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Meeting room created successfully'
            ]);

        $this->assertDatabaseHas('meeting_rooms', [
            'name' => 'Conference Room B',
            'code' => 'CONF-B',
        ]);
    }

    /** @test */
    public function it_requires_authentication_to_create_room()
    {
        $data = [
            'name' => 'Test Room',
            'code' => 'TEST',
            'capacity' => 10,
        ];

        $response = $this->postJson('/api/v1/meeting-rooms', $data);

        $response->assertStatus(401);
    }

    /** @test */
    public function it_validates_required_fields_when_creating_room()
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/v1/meeting-rooms', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'code', 'capacity']);
    }

    /** @test */
    public function it_prevents_duplicate_room_codes()
    {
        Sanctum::actingAs($this->user);
        
        MeetingRoom::factory()->create(['code' => 'CONF-A']);

        $data = [
            'name' => 'Another Room',
            'code' => 'CONF-A',
            'capacity' => 10,
        ];

        $response = $this->postJson('/api/v1/meeting-rooms', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['code']);
    }

    /** @test */
    public function it_updates_meeting_room()
    {
        Sanctum::actingAs($this->user);
        
        $room = MeetingRoom::factory()->create();

        $updateData = [
            'name' => 'Updated Name',
            'capacity' => 20,
        ];

        $response = $this->putJson("/api/v1/meeting-rooms/{$room->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Meeting room updated successfully'
            ]);

        $this->assertDatabaseHas('meeting_rooms', [
            'id' => $room->id,
            'name' => 'Updated Name',
            'capacity' => 20,
        ]);
    }

    /** @test */
    public function it_deletes_meeting_room()
    {
        Sanctum::actingAs($this->user);
        
        $room = MeetingRoom::factory()->create();

        $response = $this->deleteJson("/api/v1/meeting-rooms/{$room->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Meeting room deleted successfully'
            ]);

        $this->assertSoftDeleted('meeting_rooms', ['id' => $room->id]);
    }

    /** @test */
    public function it_checks_room_availability()
    {
        $room = MeetingRoom::factory()->create([
            'status' => 'available',
        ]);

        $data = [
            'room_id' => $room->id,
            'start_time' => now()->addHours(1)->toISOString(),
            'end_time' => now()->addHours(2)->toISOString(),
        ];

        $response = $this->postJson('/api/v1/meeting-rooms/check-availability', $data);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'available' => true,
            ]);
    }

    /** @test */
    public function it_finds_available_rooms_for_time_period()
    {
        MeetingRoom::factory()->count(3)->create(['status' => 'available']);

        $data = [
            'start_time' => now()->addHours(1)->toISOString(),
            'end_time' => now()->addHours(2)->toISOString(),
            'min_capacity' => 5,
        ];

        $response = $this->postJson('/api/v1/meeting-rooms/available', $data);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
                'count'
            ]);
    }

    /** @test */
    public function it_filters_rooms_by_status()
    {
        MeetingRoom::factory()->create(['status' => 'available']);
        MeetingRoom::factory()->create(['status' => 'maintenance']);

        $response = $this->getJson('/api/v1/meeting-rooms?status=available');

        $response->assertStatus(200);
        
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('available', $data[0]['status']);
    }

    /** @test */
    public function it_searches_rooms_by_name()
    {
        MeetingRoom::factory()->create(['name' => 'Conference Room A']);
        MeetingRoom::factory()->create(['name' => 'Meeting Room B']);

        $response = $this->getJson('/api/v1/meeting-rooms?search=Conference');

        $response->assertStatus(200);
        
        $data = $response->json('data');
        $this->assertGreaterThanOrEqual(1, count($data));
    }
}
