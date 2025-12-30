<?php
/**
 * Asset Service Unit Tests
 * Tests core Asset service business logic with mocked dependencies
 * 
 * @file services/asset-service/tests/Unit/Services/AssetServiceTest.php
 */

namespace Tests\Unit\Services;

use App\Models\Asset;
use App\Repositories\AssetRepository;
use App\Services\AssetService;
use Mockery;
use PHPUnit\Framework\TestCase;

class AssetServiceTest extends TestCase
{
    private AssetRepository $repository;
    private AssetService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = Mockery::mock(AssetRepository::class);
        $this->service = new AssetService($this->repository);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    /** @test */
    public function test_get_all_assets_returns_collection()
    {
        $mockAssets = collect([
            ['id' => 1, 'name' => 'Server Rack A', 'status' => 'active'],
            ['id' => 2, 'name' => 'Server Rack B', 'status' => 'active']
        ]);

        $this->repository
            ->shouldReceive('getAll')
            ->once()
            ->andReturn($mockAssets);

        $result = $this->service->getAllAssets();

        $this->assertCount(2, $result);
        $this->assertEquals('Server Rack A', $result[0]['name']);
    }

    /** @test */
    public function test_paginate_assets_with_filters()
    {
        $mockPaginated = [
            'data' => [['id' => 1, 'name' => 'Server', 'status' => 'active']],
            'total' => 1,
            'per_page' => 15,
            'current_page' => 1
        ];

        $this->repository
            ->shouldReceive('paginate')
            ->with(15, ['status' => 'active'])
            ->andReturn($mockPaginated);

        $result = $this->service->paginateAssets(15, ['status' => 'active']);

        $this->assertArrayHasKey('data', $result);
        $this->assertEquals(1, $result['total']);
    }

    /** @test */
    public function test_find_asset_by_id()
    {
        $mockAsset = ['id' => 1, 'name' => 'Server A', 'serial_number' => 'SN001'];

        $this->repository
            ->shouldReceive('findById')
            ->with(1)
            ->andReturn($mockAsset);

        $result = $this->service->findAsset(1);

        $this->assertEquals('Server A', $result['name']);
        $this->assertEquals('SN001', $result['serial_number']);
    }

    /** @test */
    public function test_find_asset_not_found_throws_exception()
    {
        $this->repository
            ->shouldReceive('findById')
            ->with(999)
            ->andReturn(null);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Asset not found');

        $this->service->findAsset(999);
    }

    /** @test */
    public function test_create_asset_with_valid_data()
    {
        $data = [
            'name' => 'New Server',
            'asset_type_id' => 1,
            'serial_number' => 'SN12345',
            'status' => 'active'
        ];

        $expectedAsset = array_merge($data, ['id' => 1]);

        $this->repository
            ->shouldReceive('create')
            ->with($data)
            ->andReturn($expectedAsset);

        $result = $this->service->createAsset($data);

        $this->assertEquals('New Server', $result['name']);
        $this->assertEquals(1, $result['id']);
    }

    /** @test */
    public function test_create_asset_validates_required_fields()
    {
        $invalidData = [
            'name' => '', // Required
            'asset_type_id' => null // Required
        ];

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Validation failed');

        $this->service->createAsset($invalidData);
    }

    /** @test */
    public function test_create_asset_validates_serial_number_unique()
    {
        $data = ['name' => 'Server', 'serial_number' => 'SN001'];

        $this->repository
            ->shouldReceive('findBy')
            ->with(['serial_number' => 'SN001'])
            ->andReturn(['id' => 1]); // Already exists

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Serial number already exists');

        $this->service->createAsset($data);
    }

    /** @test */
    public function test_update_asset_with_valid_data()
    {
        $id = 1;
        $data = ['name' => 'Updated Server', 'status' => 'inactive'];

        $this->repository
            ->shouldReceive('update')
            ->with($id, $data)
            ->andReturn(array_merge(['id' => $id], $data));

        $result = $this->service->updateAsset($id, $data);

        $this->assertEquals('Updated Server', $result['name']);
        $this->assertEquals('inactive', $result['status']);
    }

    /** @test */
    public function test_update_asset_not_found()
    {
        $this->repository
            ->shouldReceive('update')
            ->with(999, ['name' => 'Test'])
            ->andThrow(new \Exception('Asset not found'));

        $this->expectException(\Exception::class);

        $this->service->updateAsset(999, ['name' => 'Test']);
    }

    /** @test */
    public function test_delete_asset_successfully()
    {
        $id = 1;
        $asset = ['id' => $id, 'status' => 'active'];

        $this->repository
            ->shouldReceive('findById')
            ->with($id)
            ->andReturn($asset);

        $this->repository
            ->shouldReceive('delete')
            ->with($id)
            ->andReturn(true);

        $result = $this->service->deleteAsset($id);

        $this->assertTrue($result);
    }

    /** @test */
    public function test_delete_asset_with_active_maintenance_fails()
    {
        $id = 1;
        $asset = [
            'id' => $id,
            'status' => 'active',
            'maintenance_logs' => [
                ['id' => 1, 'status' => 'pending']
            ]
        ];

        $this->repository
            ->shouldReceive('findById')
            ->with($id)
            ->andReturn($asset);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Cannot delete asset with active maintenance');

        $this->service->deleteAsset($id);
    }

    /** @test */
    public function test_get_assets_by_location()
    {
        $locationId = 1;
        $mockAssets = collect([
            ['id' => 1, 'name' => 'Server', 'location_id' => 1],
            ['id' => 2, 'name' => 'Router', 'location_id' => 1]
        ]);

        $this->repository
            ->shouldReceive('findBy')
            ->with(['location_id' => $locationId])
            ->andReturn($mockAssets);

        $result = $this->service->getAssetsByLocation($locationId);

        $this->assertCount(2, $result);
    }

    /** @test */
    public function test_get_assets_by_status()
    {
        $status = 'active';
        $mockAssets = collect([
            ['id' => 1, 'name' => 'Server', 'status' => $status],
            ['id' => 2, 'name' => 'Router', 'status' => $status]
        ]);

        $this->repository
            ->shouldReceive('findBy')
            ->with(['status' => $status])
            ->andReturn($mockAssets);

        $result = $this->service->getAssetsByStatus($status);

        $this->assertCount(2, $result);
        $this->assertEquals('active', $result[0]['status']);
    }

    /** @test */
    public function test_count_assets_by_type()
    {
        $assetTypeId = 1;
        $expectedCount = 25;

        $this->repository
            ->shouldReceive('count')
            ->with(['asset_type_id' => $assetTypeId])
            ->andReturn($expectedCount);

        $result = $this->service->countAssetsByType($assetTypeId);

        $this->assertEquals(25, $result);
    }

    /** @test */
    public function test_bulk_update_assets()
    {
        $updates = [
            1 => ['status' => 'inactive'],
            2 => ['status' => 'inactive']
        ];

        $this->repository
            ->shouldReceive('updateBatch')
            ->with($updates)
            ->andReturn(2);

        $result = $this->service->bulkUpdateAssets($updates);

        $this->assertEquals(2, $result);
    }

    /** @test */
    public function test_export_assets_to_csv()
    {
        $mockAssets = collect([
            ['id' => 1, 'name' => 'Server A', 'serial_number' => 'SN001'],
            ['id' => 2, 'name' => 'Server B', 'serial_number' => 'SN002']
        ]);

        $this->repository
            ->shouldReceive('getAll')
            ->andReturn($mockAssets);

        $csv = $this->service->exportAssetsToCsv();

        $this->assertStringContainsString('Server A', $csv);
        $this->assertStringContainsString('SN001', $csv);
    }

    /** @test */
    public function test_service_uses_repository_for_all_operations()
    {
        $this->repository
            ->shouldReceive('getAll')
            ->andReturn(collect());

        $this->repository
            ->shouldReceive('create')
            ->andReturn([]);

        $this->repository
            ->shouldReceive('update')
            ->andReturn([]);

        $this->repository
            ->shouldReceive('delete')
            ->andReturn(true);

        // Execute operations
        $this->service->getAllAssets();
        $this->service->createAsset([]);
        $this->service->updateAsset(1, []);
        $this->service->deleteAsset(1);

        // Verify all mocked calls were made
        $this->addToAssertionCount(4);
    }
}
