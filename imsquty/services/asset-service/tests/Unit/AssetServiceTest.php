<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\AssetService;
use App\Repositories\AssetRepository;
use App\Models\Asset;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Pagination\LengthAwarePaginator;

class AssetServiceTest extends TestCase
{
    use RefreshDatabase;

    protected AssetService $assetService;
    protected AssetRepository $assetRepository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->assetRepository = new AssetRepository();
        $this->assetService = new AssetService($this->assetRepository);
    }

    public function test_getAll_returnsPaginatedAssets(): void
    {
        Asset::factory()->count(20)->create();
        $result = $this->assetService->getAll([], 15);
        $this->assertInstanceOf(LengthAwarePaginator::class, $result);
    }

    public function test_getById_returnsAssetWhenFound(): void
    {
        $asset = Asset::factory()->create();
        $result = $this->assetService->getById($asset->id);
        $this->assertEquals($asset->id, $result->id);
    }

    public function test_getById_throwsExceptionWhenNotFound(): void
    {
        $this->expectException(\Exception::class);
        $this->assetService->getById(99999);
    }

    public function test_create_createsAsset(): void
    {
        $data = [
            'asset_tag' => 'AST-' . time(),
            'name' => 'Test Asset',
            'serial_number' => 'SN-12345',
        ];
        $result = $this->assetService->create($data);
        $this->assertNotNull($result->id);
        $this->assertEquals($data['asset_tag'], $result->asset_tag);
    }

    public function test_update_updatesAsset(): void
    {
        $asset = Asset::factory()->create();
        $updatedData = ['name' => 'Updated Asset Name'];
        $result = $this->assetService->update($asset->id, $updatedData);
        $this->assertEquals('Updated Asset Name', $result->name);
    }

    public function test_delete_softDeletesAsset(): void
    {
        $asset = Asset::factory()->create();
        $this->assetService->delete($asset->id);
        $this->assertSoftDeleted($asset);
    }

    public function test_restore_recoversDeletedAsset(): void
    {
        $asset = Asset::factory()->create();
        $this->assetService->delete($asset->id);
        $this->assetService->restore($asset->id);
        $this->assertNotSoftDeleted($asset);
    }

    public function test_search_findsAssetByName(): void
    {
        Asset::factory()->create(['name' => 'Unique Test Asset']);
        $result = Asset::search('Unique Test')->get();
        $this->assertGreaterThan(0, $result->count());
    }

    public function test_search_findsAssetByTag(): void
    {
        $tag = 'AST-SEARCH-' . time();
        Asset::factory()->create(['asset_tag' => $tag]);
        $result = Asset::search($tag)->get();
        $this->assertGreaterThan(0, $result->count());
    }

    public function test_byLocation_filtersAssets(): void
    {
        Asset::factory()->create(['location_id' => 1]);
        Asset::factory()->create(['location_id' => 2]);
        $result = Asset::byLocation(1)->get();
        $this->assertTrue($result->every(fn($asset) => $asset->location_id === 1));
    }
}
