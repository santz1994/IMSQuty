<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Location;
use App\Repositories\LocationRepository;
use App\Services\LocationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class LocationServiceTest extends TestCase
{
    use RefreshDatabase;

    protected LocationService $service;
    protected LocationRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = new LocationRepository();
        $this->service = new LocationService($this->repository);
    }

    /** @test */
    public function it_can_get_all_locations_with_pagination()
    {
        Location::factory()->count(15)->create();

        $result = $this->service->getAllLocations([], 10);

        $this->assertCount(10, $result->items());
        $this->assertEquals(15, $result->total());
    }

    /** @test */
    public function it_can_filter_locations_by_search()
    {
        Location::factory()->create(['name' => 'Head Office']);
        Location::factory()->create(['name' => 'Branch Office']);

        $result = $this->service->getAllLocations(['search' => 'Head'], 10);

        $this->assertCount(1, $result->items());
    }

    /** @test */
    public function it_can_create_location_with_valid_data()
    {
        $data = [
            'name' => 'New Location',
            'code' => 'NL001',
            'type' => 'Office'
        ];

        $location = $this->service->createLocation($data);

        $this->assertInstanceOf(Location::class, $location);
        $this->assertEquals('New Location', $location->name);
        $this->assertDatabaseHas('locations', ['code' => 'NL001']);
    }

    /** @test */
    public function it_throws_exception_when_creating_location_with_duplicate_code()
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('code already exists');

        Location::factory()->create(['code' => 'DUP001']);

        $this->service->createLocation([
            'name' => 'Duplicate',
            'code' => 'DUP001',
            'type' => 'Office'
        ]);
    }

    /** @test */
    public function it_can_update_location()
    {
        $location = Location::factory()->create(['name' => 'Old Name']);

        $updated = $this->service->updateLocation($location->id, [
            'name' => 'New Name',
            'code' => $location->code,
            'type' => $location->type
        ]);

        $this->assertEquals('New Name', $updated->name);
    }

    /** @test */
    public function it_throws_exception_when_updating_nonexistent_location()
    {
        $this->expectException(ModelNotFoundException::class);

        $this->service->updateLocation(99999, ['name' => 'Test']);
    }

    /** @test */
    public function it_can_delete_location()
    {
        $location = Location::factory()->create();

        $result = $this->service->deleteLocation($location->id);

        $this->assertTrue($result);
        $this->assertSoftDeleted('locations', ['id' => $location->id]);
    }

    /** @test */
    public function it_can_restore_deleted_location()
    {
        $location = Location::factory()->create();
        $location->delete();

        $restored = $this->service->restoreLocation($location->id);

        $this->assertNull($restored->deleted_at);
    }

    /** @test */
    public function it_can_get_active_locations_only()
    {
        Location::factory()->create(['is_active' => true]);
        Location::factory()->create(['is_active' => true]);
        Location::factory()->create(['is_active' => false]);

        $active = $this->service->getActiveLocations();

        $this->assertCount(2, $active);
    }

    /** @test */
    public function it_can_get_location_hierarchy()
    {
        $parent = Location::factory()->create(['parent_id' => null]);
        Location::factory()->create(['parent_id' => $parent->id]);
        Location::factory()->create(['parent_id' => $parent->id]);

        $hierarchy = $this->service->getLocationsHierarchy();

        $this->assertIsArray($hierarchy);
        $this->assertArrayHasKey('children', $hierarchy[0]);
        $this->assertCount(2, $hierarchy[0]['children']);
    }
}
