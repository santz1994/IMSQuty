<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Division;
use App\Repositories\DivisionRepository;
use App\Services\DivisionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class DivisionServiceTest extends TestCase
{
    use RefreshDatabase;

    protected DivisionService $service;
    protected DivisionRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = new DivisionRepository();
        $this->service = new DivisionService($this->repository);
    }

    /** @test */
    public function it_can_create_division()
    {
        $data = [
            'name' => 'IT Department',
            'code' => 'IT001',
            'description' => 'Information Technology'
        ];

        $division = $this->service->createDivision($data);

        $this->assertInstanceOf(Division::class, $division);
        $this->assertEquals('IT Department', $division->name);
    }

    /** @test */
    public function it_throws_exception_on_duplicate_code()
    {
        $this->expectException(\Exception::class);

        Division::factory()->create(['code' => 'IT001']);

        $this->service->createDivision([
            'name' => 'IT Dept',
            'code' => 'IT001'
        ]);
    }

    /** @test */
    public function it_can_update_division()
    {
        $division = Division::factory()->create();

        $updated = $this->service->updateDivision($division->id, [
            'name' => 'Updated Name',
            'code' => $division->code
        ]);

        $this->assertEquals('Updated Name', $updated->name);
    }

    /** @test */
    public function it_can_delete_and_restore_division()
    {
        $division = Division::factory()->create();

        $this->service->deleteDivision($division->id);
        $this->assertSoftDeleted('divisions', ['id' => $division->id]);

        $restored = $this->service->restoreDivision($division->id);
        $this->assertNull($restored->deleted_at);
    }

    /** @test */
    public function it_can_get_active_divisions()
    {
        Division::factory()->create(['is_active' => true]);
        Division::factory()->create(['is_active' => false]);

        $active = $this->service->getActiveDivisions();

        $this->assertCount(1, $active);
    }

    /** @test */
    public function it_can_get_division_hierarchy()
    {
        $parent = Division::factory()->create(['parent_id' => null]);
        Division::factory()->create(['parent_id' => $parent->id]);

        $hierarchy = $this->service->getDivisionsHierarchy();

        $this->assertIsArray($hierarchy);
        $this->assertArrayHasKey('children', $hierarchy[0]);
    }
}
