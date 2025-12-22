<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Services\UserService;
use App\Repositories\UserRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Mockery;

class UserServiceTest extends TestCase
{
    use RefreshDatabase;

    protected UserService $userService;
    protected UserRepository $userRepository;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->userRepository = new UserRepository();
        $this->userService = new UserService($this->userRepository);
        
        // Create default role
        Role::create(['name' => 'User', 'guard_name' => 'web']);
    }

    /** @test */
    public function test_getAllUsers_returnsPaginatedUsers(): void
    {
        // Arrange
        User::factory()->count(25)->create();
        
        // Act
        $result = $this->userService->getAllUsers([], 15);
        
        // Assert
        $this->assertNotNull($result);
        $this->assertEquals(15, $result->perPage());
        $this->assertGreaterThan(0, $result->total());
    }

    /** @test */
    public function test_getAllUsers_filtersUsersByStatus(): void
    {
        // Arrange
        User::factory()->count(5)->create(['status' => 'active']);
        User::factory()->count(3)->create(['status' => 'inactive']);
        
        // Act
        $result = $this->userService->getAllUsers(['status' => 'active'], 20);
        
        // Assert
        $activeUsers = $result->items();
        foreach ($activeUsers as $user) {
            $this->assertEquals('active', $user->status);
        }
    }

    /** @test */
    public function test_getAllUsers_filtersUsersByRole(): void
    {
        // Arrange
        $adminRole = Role::create(['name' => 'Admin', 'guard_name' => 'web']);
        
        $adminUser = User::factory()->create();
        $adminUser->assignRole('Admin');
        
        User::factory()->count(5)->create();
        
        // Act
        $result = $this->userService->getAllUsers(['role' => 'Admin'], 20);
        
        // Assert
        $this->assertGreaterThanOrEqual(1, $result->total());
    }

    /** @test */
    public function test_getUserById_returnsUserWithRelationships(): void
    {
        // Arrange
        $user = User::factory()->create();
        $role = Role::create(['name' => 'Manager', 'guard_name' => 'web']);
        $user->assignRole('Manager');
        
        // Act
        $result = $this->userService->getUserById($user->id);
        
        // Assert
        $this->assertNotNull($result);
        $this->assertEquals($user->id, $result->id);
        $this->assertTrue($result->relationLoaded('roles'));
        $this->assertTrue($result->relationLoaded('permissions'));
    }

    /** @test */
    public function test_getUserById_returnsNull_whenUserNotFound(): void
    {
        // Act
        $result = $this->userService->getUserById(99999);
        
        // Assert
        $this->assertNull($result);
    }

    /** @test */
    public function test_createUser_createsNewUserWithHashedPassword(): void
    {
        // Arrange
        $userData = [
            'username' => 'testuser',
            'email' => 'test@example.com',
            'password' => 'PlainPassword123',
            'first_name' => 'Test',
            'last_name' => 'User',
            'status' => 'active'
        ];
        
        // Act
        $user = $this->userService->createUser($userData);
        
        // Assert
        $this->assertNotNull($user);
        $this->assertEquals('testuser', $user->username);
        $this->assertEquals('test@example.com', $user->email);
        $this->assertNotEquals('PlainPassword123', $user->password);
        $this->assertTrue(Hash::check('PlainPassword123', $user->password));
    }

    /** @test */
    public function test_createUser_assignsDefaultRole(): void
    {
        // Arrange
        $userData = [
            'username' => 'testuser',
            'email' => 'test@example.com',
            'password' => 'Password123',
            'first_name' => 'Test',
            'last_name' => 'User'
        ];
        
        // Act
        $user = $this->userService->createUser($userData);
        
        // Assert
        $this->assertTrue($user->hasRole('User'));
    }

    /** @test */
    public function test_createUser_assignsSpecificRole_whenProvided(): void
    {
        // Arrange
        Role::create(['name' => 'Admin', 'guard_name' => 'web']);
        
        $userData = [
            'username' => 'adminuser',
            'email' => 'admin@example.com',
            'password' => 'Password123',
            'first_name' => 'Admin',
            'last_name' => 'User',
            'role' => 'Admin'
        ];
        
        // Act
        $user = $this->userService->createUser($userData);
        
        // Assert
        $this->assertTrue($user->hasRole('Admin'));
        $this->assertFalse($user->hasRole('User'));
    }

    /** @test */
    public function test_createUser_createsAuditLog(): void
    {
        // Arrange
        $userData = [
            'username' => 'audituser',
            'email' => 'audit@example.com',
            'password' => 'Password123',
            'first_name' => 'Audit',
            'last_name' => 'User'
        ];
        
        // Act
        $user = $this->userService->createUser($userData);
        
        // Assert
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'created',
            'auditable_type' => User::class,
            'auditable_id' => $user->id
        ]);
    }

    /** @test */
    public function test_updateUser_updatesUserData(): void
    {
        // Arrange
        $user = User::factory()->create([
            'first_name' => 'Original',
            'last_name' => 'Name'
        ]);
        
        $updateData = [
            'first_name' => 'Updated',
            'last_name' => 'Name',
            'phone' => '081234567890'
        ];
        
        // Act
        $updatedUser = $this->userService->updateUser($user->id, $updateData);
        
        // Assert
        $this->assertNotNull($updatedUser);
        $this->assertEquals('Updated', $updatedUser->first_name);
        $this->assertEquals('081234567890', $updatedUser->phone);
    }

    /** @test */
    public function test_updateUser_hashesPassword_whenProvided(): void
    {
        // Arrange
        $user = User::factory()->create();
        $originalPassword = $user->password;
        
        $updateData = [
            'password' => 'NewPassword123'
        ];
        
        // Act
        $updatedUser = $this->userService->updateUser($user->id, $updateData);
        
        // Assert
        $this->assertNotEquals($originalPassword, $updatedUser->password);
        $this->assertTrue(Hash::check('NewPassword123', $updatedUser->password));
    }

    /** @test */
    public function test_updateUser_syncsRoles_whenProvided(): void
    {
        // Arrange
        $user = User::factory()->create();
        $user->assignRole('User');
        
        $adminRole = Role::create(['name' => 'Admin', 'guard_name' => 'web']);
        
        $updateData = [
            'role' => 'Admin'
        ];
        
        // Act
        $updatedUser = $this->userService->updateUser($user->id, $updateData);
        
        // Assert
        $this->assertTrue($updatedUser->hasRole('Admin'));
        $this->assertFalse($updatedUser->hasRole('User'));
    }

    /** @test */
    public function test_updateUser_createsAuditLog(): void
    {
        // Arrange
        $user = User::factory()->create(['first_name' => 'Original']);
        
        // Act
        $this->userService->updateUser($user->id, ['first_name' => 'Updated']);
        
        // Assert
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'updated',
            'auditable_type' => User::class,
            'auditable_id' => $user->id
        ]);
    }

    /** @test */
    public function test_deleteUser_softDeletesUser(): void
    {
        // Arrange
        $user = User::factory()->create();
        
        // Act
        $result = $this->userService->deleteUser($user->id);
        
        // Assert
        $this->assertTrue($result);
        $this->assertSoftDeleted('users', ['id' => $user->id]);
    }

    /** @test */
    public function test_deleteUser_createsAuditLog(): void
    {
        // Arrange
        $user = User::factory()->create();
        
        // Act
        $this->userService->deleteUser($user->id);
        
        // Assert
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'deleted',
            'auditable_type' => User::class,
            'auditable_id' => $user->id
        ]);
    }

    /** @test */
    public function test_restoreUser_restoresSoftDeletedUser(): void
    {
        // Arrange
        $user = User::factory()->create();
        $user->delete();
        
        // Act
        $restored = $this->userService->restoreUser($user->id);
        
        // Assert
        $this->assertNotNull($restored);
        $this->assertNull($restored->deleted_at);
    }

    /** @test */
    public function test_restoreUser_createsAuditLog(): void
    {
        // Arrange
        $user = User::factory()->create();
        $user->delete();
        
        // Act
        $this->userService->restoreUser($user->id);
        
        // Assert
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'restored',
            'auditable_type' => User::class,
            'auditable_id' => $user->id
        ]);
    }

    /** @test */
    public function test_assignRoles_syncsRolesToUser(): void
    {
        // Arrange
        $user = User::factory()->create();
        $managerRole = Role::create(['name' => 'Manager', 'guard_name' => 'web']);
        $techRole = Role::create(['name' => 'Technician', 'guard_name' => 'web']);
        
        // Act
        $result = $this->userService->assignRoles($user->id, ['Manager', 'Technician']);
        
        // Assert
        $this->assertNotNull($result);
        $this->assertTrue($result->hasRole('Manager'));
        $this->assertTrue($result->hasRole('Technician'));
    }

    /** @test */
    public function test_assignRoles_replacesExistingRoles(): void
    {
        // Arrange
        $user = User::factory()->create();
        $user->assignRole('User');
        
        $adminRole = Role::create(['name' => 'Admin', 'guard_name' => 'web']);
        
        // Act
        $result = $this->userService->assignRoles($user->id, ['Admin']);
        
        // Assert
        $this->assertTrue($result->hasRole('Admin'));
        $this->assertFalse($result->hasRole('User'));
    }

    /** @test */
    public function test_getUserPermissions_returnsAllPermissionTypes(): void
    {
        // Arrange
        $user = User::factory()->create();
        $role = Role::create(['name' => 'Manager', 'guard_name' => 'web']);
        $user->assignRole('Manager');
        
        // Act
        $permissions = $this->userService->getUserPermissions($user->id);
        
        // Assert
        $this->assertIsArray($permissions);
        $this->assertArrayHasKey('direct_permissions', $permissions);
        $this->assertArrayHasKey('role_permissions', $permissions);
        $this->assertArrayHasKey('all_permissions', $permissions);
    }

    /** @test */
    public function test_createUser_usesTransaction_rollsBackOnError(): void
    {
        // Arrange: Mock repository to throw exception after user creation
        $mockRepo = Mockery::mock(UserRepository::class);
        $mockRepo->shouldReceive('create')
            ->once()
            ->andThrow(new \Exception('Database error'));
        
        $service = new UserService($mockRepo);
        
        $userData = [
            'username' => 'failuser',
            'email' => 'fail@example.com',
            'password' => 'Password123',
            'first_name' => 'Fail',
            'last_name' => 'User'
        ];
        
        // Act & Assert
        $this->expectException(\Exception::class);
        $service->createUser($userData);
        
        // User should not exist in database
        $this->assertDatabaseMissing('users', [
            'username' => 'failuser'
        ]);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
