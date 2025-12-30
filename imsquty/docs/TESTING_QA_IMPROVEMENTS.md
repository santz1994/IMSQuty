# TESTING & QUALITY ASSURANCE IMPROVEMENTS
**Date**: December 29, 2025  
**Status**: Ready for Implementation  
**Target**: 98%+ test coverage, zero known bugs  

---

## OVERVIEW

Quality improvements across:
1. **Unit Testing** - PHP services, JavaScript utilities
2. **Feature/Integration Testing** - API endpoints, business flows
3. **E2E Testing** - User workflows, critical paths
4. **Performance Testing** - Load testing, stress testing
5. **Security Testing** - Vulnerability scanning, auth testing

---

## 1. UNIT TESTING STRATEGY

### Service Unit Tests
```php
// services/asset-service/tests/Unit/Services/AssetServiceTest.php
namespace Tests\Unit\Services;

use App\Services\AssetService;
use App\Repositories\AssetRepository;
use Mockery;
use PHPUnit\Framework\TestCase;

class AssetServiceTest extends TestCase
{
    private $repository;
    private $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = Mockery::mock(AssetRepository::class);
        $this->service = new AssetService($this->repository);
    }

    public function test_get_all_assets_returns_collection()
    {
        $mockAssets = collect([
            ['id' => 1, 'name' => 'Asset 1'],
            ['id' => 2, 'name' => 'Asset 2']
        ]);

        $this->repository
            ->shouldReceive('getAll')
            ->once()
            ->andReturn($mockAssets);

        $result = $this->service->getAllAssets();
        $this->assertCount(2, $result);
    }

    public function test_create_asset_validates_input()
    {
        $this->expectException(\Exception::class);
        $this->service->createAsset([]);
    }

    public function test_delete_asset_checks_maintenance_status()
    {
        $this->repository
            ->shouldReceive('findById')
            ->with(1)
            ->andReturn(new AssetMock(['id' => 1]));

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Cannot delete asset with active maintenance');

        $this->service->deleteAsset(1);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
```

### JavaScript Unit Tests
```javascript
// api-gateway/tests/unit/circuitBreaker.test.js
import { CircuitBreaker } from '../../src/middleware/circuitBreaker';

describe('CircuitBreaker', () => {
  let breaker;

  beforeEach(() => {
    breaker = new CircuitBreaker('test-service', {
      failureThreshold: 2,
      successThreshold: 2
    });
  });

  test('should start in CLOSED state', () => {
    expect(breaker.state).toBe('CLOSED');
  });

  test('should open circuit after threshold failures', () => {
    breaker.recordFailure();
    expect(breaker.state).toBe('CLOSED');

    breaker.recordFailure();
    expect(breaker.state).toBe('OPEN');
  });

  test('should move to HALF_OPEN after timeout', async () => {
    breaker.state = 'OPEN';
    breaker.nextAttempt = Date.now() - 1000; // Past time

    await breaker.makeRequest(() => Promise.resolve());
    expect(breaker.state).toBe('HALF_OPEN');
  });

  test('should reset success count on failure in HALF_OPEN', () => {
    breaker.state = 'HALF_OPEN';
    breaker.successCount = 1;

    breaker.recordFailure();
    expect(breaker.successCount).toBe(0);
    expect(breaker.state).toBe('OPEN');
  });
});
```

---

## 2. FEATURE/INTEGRATION TESTING

### API Endpoint Tests
```php
// services/asset-service/tests/Feature/AssetControllerTest.php
namespace Tests\Feature;

use App\Models\Asset;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Passport\Passport;
use Tests\TestCase;

class AssetControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        Passport::actingAs($this->user);
    }

    public function test_can_list_assets()
    {
        Asset::factory()->count(5)->create();

        $response = $this->getJson('/api/assets');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => ['*' => ['id', 'name', 'serial_number', 'status']],
                'pagination'
            ])
            ->assertJsonCount(5, 'data');
    }

    public function test_can_create_asset_with_valid_data()
    {
        $data = Asset::factory()->make()->toArray();

        $response = $this->postJson('/api/assets', $data);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Asset created successfully');

        $this->assertDatabaseHas('assets', $data);
    }

    public function test_cannot_create_asset_with_invalid_data()
    {
        $response = $this->postJson('/api/assets', [
            'name' => '', // Required
            'asset_type_id' => 999 // Non-existent
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonValidationErrors(['name', 'asset_type_id']);
    }

    public function test_can_update_asset()
    {
        $asset = Asset::factory()->create();
        $newData = ['name' => 'Updated Name', 'status' => 'inactive'];

        $response = $this->patchJson("/api/assets/{$asset->id}", $newData);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Updated Name');

        $this->assertDatabaseHas('assets', ['id' => $asset->id, 'status' => 'inactive']);
    }

    public function test_can_delete_asset()
    {
        $asset = Asset::factory()->create();

        $response = $this->deleteJson("/api/assets/{$asset->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('assets', ['id' => $asset->id]);
    }

    public function test_cannot_delete_asset_with_active_maintenance()
    {
        $asset = Asset::factory()
            ->has(MaintenanceLog::factory()->state(['status' => 'pending']))
            ->create();

        $response = $this->deleteJson("/api/assets/{$asset->id}");

        $response->assertStatus(400)
            ->assertJsonPath('success', false);

        $this->assertDatabaseHas('assets', ['id' => $asset->id]);
    }

    public function test_audit_log_created_on_asset_creation()
    {
        $data = Asset::factory()->make()->toArray();
        $this->postJson('/api/assets', $data);

        $this->assertDatabaseHas('audit_logs', [
            'model_type' => 'Asset',
            'action' => 'created'
        ]);
    }

    public function test_unauthenticated_user_cannot_access_assets()
    {
        Passport::actingAs(null);

        $response = $this->getJson('/api/assets');
        $response->assertStatus(401);
    }
}
```

---

## 3. BEHAVIOR DRIVEN TESTING

### Gherkin Scenarios
```gherkin
# features/asset_management.feature
Feature: Asset Management
  As a facility manager
  I want to manage assets
  So that I can track inventory

  Scenario: Create a new asset
    Given I am authenticated as "facility_manager"
    When I submit a form to create an asset with:
      | field | value |
      | name | Server Rack A |
      | asset_type | IT Equipment |
      | serial_number | SN123456 |
    Then an asset should be created
    And I should see a success message
    And an audit log should record the creation

  Scenario: Cannot delete asset with active maintenance
    Given an asset "Server Rack A" with active maintenance
    When I try to delete the asset
    Then the deletion should be denied
    And I should see error message "Cannot delete asset with active maintenance"
    And an audit log should record the failed deletion attempt
```

### Behat Implementation
```php
// features/bootstrap/AssetContext.php
use Behat\Behat\Context\Context;
use Behat\Gherkin\Node\TableNode;

class AssetContext implements Context
{
    private $user;
    private $response;
    private $createdAsset;

    /**
     * @Given I am authenticated as :role
     */
    public function authenticateAs($role)
    {
        $this->user = User::factory()
            ->create(['role' => $role]);
    }

    /**
     * @When I submit a form to create an asset with:
     */
    public function submitAssetCreationForm(TableNode $table)
    {
        $data = $table->rowsHash();
        
        $this->response = $this->makeAuthenticatedRequest('POST', '/api/assets', $data);
    }

    /**
     * @Then an asset should be created
     */
    public function assetShouldBeCreated()
    {
        $this->createdAsset = Asset::latest()->first();
        assert($this->createdAsset !== null, 'No asset was created');
    }

    /**
     * @And I should see a success message
     */
    public function shouldSeeSuccessMessage()
    {
        assert($this->response->json('success') === true);
    }

    /**
     * @And an audit log should record the creation
     */
    public function auditLogShouldRecord()
    {
        $auditLog = AuditLog::where('model_id', $this->createdAsset->id)
            ->where('action', 'created')
            ->first();

        assert($auditLog !== null, 'No audit log recorded');
    }
}
```

---

## 4. E2E TESTING

### Critical User Workflows
```javascript
// frontend/tests/e2e/asset-creation.spec.js
describe('Asset Creation Workflow', () => {
  beforeEach(() => {
    cy.login('facility_manager', 'password');
    cy.visit('/assets');
  });

  it('should create asset with valid data', () => {
    // Navigate to creation
    cy.get('[data-cy=btn-create-asset]').click();
    
    // Fill form
    cy.get('[data-cy=input-name]').type('New Server');
    cy.get('[data-cy=select-type]').select('IT Equipment');
    cy.get('[data-cy=input-serial]').type('SN987654');
    cy.get('[data-cy=input-manufacturer]').select('Dell');
    cy.get('[data-cy=input-purchase-date]').type('2025-01-01');
    
    // Submit
    cy.get('[data-cy=btn-submit]').click();
    
    // Verify success
    cy.get('[data-cy=alert-success]').should('be.visible');
    cy.url().should('include', '/assets/');
    cy.get('[data-cy=asset-name]').should('contain', 'New Server');
  });

  it('should prevent duplicate serial numbers', () => {
    cy.get('[data-cy=btn-create-asset]').click();
    cy.get('[data-cy=input-serial]').type('SN123456'); // Existing
    cy.get('[data-cy=btn-submit]').click();
    
    cy.get('[data-cy=error-serial]').should('contain', 'Serial number already exists');
  });

  it('should show loading state during creation', () => {
    cy.get('[data-cy=btn-create-asset]').click();
    cy.get('[data-cy=input-name]').type('Pending Asset');
    cy.get('[data-cy=btn-submit]').click();
    
    cy.get('[data-cy=btn-submit]').should('be.disabled');
    cy.get('[data-cy=spinner]').should('be.visible');
  });
});
```

---

## 5. PERFORMANCE TESTING

### Load Testing
```javascript
// tests/performance/load-test.js
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 20 },   // Ramp up
    { duration: '1m30s', target: 100 }, // Stay at 100
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(99)<1500'], // 99% under 1.5s
    http_req_failed: ['<0.1'],         // <0.1% failures
  },
};

export default function () {
  // List assets
  let res = http.get('http://localhost:3000/api/assets');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  // Create asset
  res = http.post('http://localhost:3000/api/assets', {
    name: `Asset ${__VU}_${__ITER}`,
    asset_type_id: 1,
    serial_number: `SN_${__VU}_${__ITER}`,
    manufacturer_id: 1,
    purchase_date: '2025-01-01',
    owner_id: 1,
    location_id: 1,
  });
  check(res, {
    'create status is 201': (r) => r.status === 201,
  });
}
```

### Run Load Test
```bash
k6 run tests/performance/load-test.js \
  --vus 10 \
  --duration 5m \
  --out json=results.json
```

---

## 6. SECURITY TESTING

### Authentication Testing
```php
// services/shared/tests/Security/AuthenticationTest.php
class AuthenticationTest extends TestCase
{
    public function test_missing_jwt_token_returns_401()
    {
        $response = $this->getJson('/api/assets');
        $response->assertStatus(401)
            ->assertJsonPath('error.code', 'UNAUTHORIZED');
    }

    public function test_invalid_jwt_token_returns_401()
    {
        $response = $this->getJson('/api/assets', [
            'Authorization' => 'Bearer invalid_token'
        ]);
        $response->assertStatus(401);
    }

    public function test_expired_jwt_token_returns_401()
    {
        $token = JWTAuth::fromUser($this->user);
        // Manipulate token to be expired
        $expiredToken = str_replace(
            substr($token, -10),
            str_repeat('A', 10),
            $token
        );

        $response = $this->getJson('/api/assets', [
            'Authorization' => "Bearer {$expiredToken}"
        ]);
        $response->assertStatus(401);
    }
}
```

### Authorization Testing
```php
// tests/Security/AuthorizationTest.php
class AuthorizationTest extends TestCase
{
    public function test_user_cannot_delete_others_asset()
    {
        $owner = User::factory()->create();
        $asset = Asset::factory()->for($owner)->create();
        $otherUser = User::factory()->create();

        Passport::actingAs($otherUser);
        $response = $this->deleteJson("/api/assets/{$asset->id}");

        $response->assertStatus(403)
            ->assertJsonPath('error.code', 'FORBIDDEN');
    }

    public function test_viewer_cannot_modify_asset()
    {
        $viewer = User::factory()->create(['role' => 'viewer']);
        $asset = Asset::factory()->create();

        Passport::actingAs($viewer);
        $response = $this->patchJson("/api/assets/{$asset->id}", ['status' => 'inactive']);

        $response->assertStatus(403);
    }
}
```

### Input Validation Testing
```php
// tests/Security/ValidationTest.php
class ValidationTest extends TestCase
{
    public function test_xss_injection_blocked()
    {
        $malicious = '<script>alert("xss")</script>';

        $response = $this->postJson('/api/assets', [
            'name' => $malicious,
            'asset_type_id' => 1,
            // ... other fields
        ]);

        $response->assertStatus(422);

        $asset = Asset::latest()->first();
        $this->assertNotContains('<script>', $asset->name);
    }

    public function test_sql_injection_blocked()
    {
        $malicious = "'; DROP TABLE assets; --";

        $response = $this->postJson('/api/assets', [
            'serial_number' => $malicious,
            // ... other fields
        ]);

        $response->assertStatus(422);

        // Table still exists
        $this->assertDatabaseHas('assets', []);
    }
}
```

---

## 7. FIXING FAILING TESTS

### Identify Failing Tests
```bash
# Run tests with verbose output
php artisan test --verbose

# Run only failing tests
php artisan test --failed

# Run specific test file
php artisan test tests/Feature/AssetControllerTest.php
```

### Common Test Failures & Fixes
```php
// Issue: Database state not reset between tests
// Fix: Use RefreshDatabase trait
use Illuminate\Foundation\Testing\RefreshDatabase;

class AssetControllerTest extends TestCase
{
    use RefreshDatabase; // Reset DB after each test
}

// Issue: Authentication not set up
// Fix: Create user in setUp
protected function setUp(): void
{
    parent::setUp();
    $this->user = User::factory()->create();
    Passport::actingAs($this->user);
}

// Issue: Async operations not awaited
// Fix: Use refeshes or wait
$this->travelTo(now()->addHours(1));
// or
$this->freezeTime();

// Issue: Model factory incomplete
// Fix: Ensure all required fields
Asset::factory()
    ->state(['asset_type_id' => AssetType::first()->id])
    ->create();
```

---

## 8. CONTINUOUS TESTING SETUP

### GitHub Actions
```yaml
# .github/workflows/tests.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: test
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3

    steps:
      - uses: actions/checkout@v3

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.1'
          extensions: mysql, redis

      - name: Install dependencies
        run: composer install

      - name: Run migrations
        run: php artisan migrate --env=testing

      - name: Run tests
        run: php artisan test --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## TEST COVERAGE TARGETS

| Component | Current | Target | Action |
|-----------|---------|--------|--------|
| Services | 85% | 95% | Add missing edge cases |
| Controllers | 80% | 90% | Add error path tests |
| Models | 75% | 90% | Add relationship tests |
| Repositories | 70% | 90% | Add query tests |
| **Overall** | **78%** | **95%** | **Systematic improvement** |

---

## TESTING CHECKLIST

- [ ] Create unit tests for all services (min 90% coverage)
- [ ] Create feature tests for all endpoints
- [ ] Create E2E tests for critical workflows
- [ ] Add security tests (auth, validation, injection)
- [ ] Add performance tests (load, stress)
- [ ] Fix all failing tests (document root causes)
- [ ] Set up CI/CD with automated testing
- [ ] Add code coverage reporting
- [ ] Document test patterns in wiki
- [ ] Train team on testing best practices

---

**Status**: Ready to Implement  
**Effort**: 4-5 hours  
**Priority**: CRITICAL  
**Impact**: Reliability & maintainability
