<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Division;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class UserControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $adminUser;
    protected Role $adminRole;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create roles
        $this->adminRole = Role::create(['name' => 'Admin', 'guard_name' => 'web']);
        $userRole = Role::create(['name' => 'User', 'guard_name' => 'web']);
        
        // Create permissions
        $permissions = [
            'users.view',
            'users.create',
            'users.update',
            'users.delete',
            'users.restore',
            'users.assign-roles',
        ];
        
        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission, 'guard_name' => 'web']);
        }
        
        // Assign all permissions to admin role
        $this->adminRole->givePermissionTo($permissions);
        
        // Create admin user
        $this->adminUser = User::factory()->create([
            'username' => 'admin',
            'email' => 'admin@quty.co.id',
            'status' => 'active'
        ]);
        $this->adminUser->assignRole($this->adminRole);
    }

    /** @test */
    public function test_index_returnsUsersList_withPagination(): void
    {
        // Arrange: Create test users
        User::factory()->count(20)->create(['status' => 'active']);
        
        // Act
        $response = $this->actingAs($this->adminUser)
            ->getJson('/api/v1/users');
        
        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'username',
                            'email',
                            'first_name',
                            'last_name',
                            'full_name',
                            'status',
                            'created_at',
                            'updated_at'
                        ]
                    ],
                    'current_page',
                    'per_page',
                    'total'
                ],
                'message'
            ]);
        
        $this->assertEquals(15, count($response->json('data.data'))); // Default per_page
    }

    /** @test */
    public function test_index_filtersUsersByStatus(): void
    {
        // Arrange
        User::factory()->count(5)->create(['status' => 'active']);
        User::factory()->count(3)->create(['status' => 'inactive']);
        
        // Act
        $response = $this->actingAs($this->adminUser)
            ->getJson('/api/v1/users?status=active');
        
        // Assert
        $response->assertStatus(200);
        $users = $response->json('data.data');
        $this->assertGreaterThanOrEqual(5, count($users));
        
        foreach ($users as $user) {
            $this->assertEquals('active', $user['status']);
        }
    }

    /** @test */
    public function test_index_searchesUsersByNameOrEmail(): void
    {
        // Arrange
        User::factory()->create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@example.com'
        ]);
        User::factory()->count(5)->create();
        
        // Act
        $response = $this->actingAs($this->adminUser)
            ->getJson('/api/v1/users?search=John');
        
        // Assert
        $response->assertStatus(200);
        $users = $response->json('data.data');
        $this->assertGreaterThanOrEqual(1, count($users));
    }

    /** @test */
    public function test_show_returnsSingleUser_withRelationships(): void
    {
        // Arrange
        $division = Division::create(['name' => 'IT Department', 'status' => 'active']);
        $user = User::factory()->create(['division_id' => $division->id]);
        $user->assignRole('User');
        
        // Act
        $response = $this->actingAs($this->adminUser)
            ->getJson("/api/v1/users/{$user->id}");
        
        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'username',
                    'email',
                    'first_name',
                    'last_name',
                    'full_name',
                    'phone',
                    'status',
                    'division',
                    'roles',
                    'permissions',
                    'created_at',
                    'updated_at'
                ],
                'message'
            ]);
        
        $this->assertEquals($user->id, $response->json('data.id'));
        $this->assertNotNull($response->json('data.division'));
        $this->assertIsArray($response->json('data.roles'));
    }

    /** @test */
    public function test_show_returns404_whenUserNotFound(): void
    {
        // Act
        $response = $this->actingAs($this->adminUser)
            ->getJson('/api/v1/users/99999');
        
        // Assert
        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'error' => 'User not found'
            ]);
    }

    /** @test */
    public function test_store_createsNewUser_withValidData(): void
    {
        // Arrange
        $userData = [
            'username' => 'newuser123',
            'email' => 'newuser@example.com',
            'password' => 'Password123!',
            'first_name' => 'New',
            'last_name' => 'User',
            'phone' => '081234567890',
            'status' => 'active'
        ];
        
        // Act
        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/v1/users', $userData);
        
        // Assert
        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'data' => ['id', 'username', 'email', 'first_name', 'last_name'],
                'message'
            ]);
        
        $this->assertDatabaseHas('users', [
            'username' => 'newuser123',
            'email' => 'newuser@example.com',
            'first_name' => 'New',
            'last_name' => 'User'
        ]);
        
        // Verify password is hashed
        $user = User::where('username', 'newuser123')->first();
        $this->assertNotEquals('Password123!', $user->password);
        $this->assertTrue(\Hash::check('Password123!', $user->password));
    }

    /** @test */
    public function test_store_createsAuditLog_forUserCreation(): void
    {
        // Arrange
        $userData = [
            'username' => 'audituser',
            'email' => 'audit@example.com',
            'password' => 'Password123!',
            'first_name' => 'Audit',
            'last_name' => 'User'
        ];
        
        // Act
        $this->actingAs($this->adminUser)
            ->postJson('/api/v1/users', $userData);
        
        // Assert
        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $this->adminUser->id,
            'action' => 'created',
            'auditable_type' => User::class
        ]);
    }

    /** @test */
    public function test_store_failsValidation_withInvalidUsername(): void
    {
        // Arrange
        $userData = [
            'username' => 'ab', // Too short
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'first_name' => 'Test',
            'last_name' => 'User'
        ];
        
        // Act
        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/v1/users', $userData);
        
        // Assert
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['username']);
    }

    /** @test */
    public function test_store_failsValidation_withDuplicateEmail(): void
    {
        // Arrange
        $existingUser = User::factory()->create(['email' => 'existing@example.com']);
        
        $userData = [
            'username' => 'newuser',
            'email' => 'existing@example.com', // Duplicate
            'password' => 'Password123!',
            'first_name' => 'Test',
            'last_name' => 'User'
        ];
        
        // Act
        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/v1/users', $userData);
        
        // Assert
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /** @test */
    public function test_store_failsValidation_withWeakPassword(): void
    {
        // Arrange
        $userData = [
            'username' => 'testuser',
            'email' => 'test@example.com',
            'password' => 'weak', // Too weak
            'first_name' => 'Test',
            'last_name' => 'User'
        ];
        
        // Act
        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/v1/users', $userData);
        
        // Assert
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    /** @test */
    public function test_update_updatesExistingUser(): void
    {
        // Arrange
        $user = User::factory()->create([
            'first_name' => 'Old',
            'last_name' => 'Name'
        ]);
        
        $updateData = [
            'first_name' => 'New',
            'last_name' => 'Name Updated',
            'phone' => '081234567890'
        ];
        
        // Act
        $response = $this->actingAs($this->adminUser)
            ->putJson("/api/v1/users/{$user->id}", $updateData);
        
        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'User updated successfully'
            ]);
        
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'first_name' => 'New',
            'last_name' => 'Name Updated',
            'phone' => '081234567890'
        ]);
    }

    /** @test */
    public function test_update_createsAuditLog_withOldAndNewValues(): void
    {
        // Arrange
        $user = User::factory()->create(['first_name' => 'Original']);
        
        // Act
        $this->actingAs($this->adminUser)
            ->putJson("/api/v1/users/{$user->id}", ['first_name' => 'Updated']);
        
        // Assert
        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $this->adminUser->id,
            'action' => 'updated',
            'auditable_type' => User::class,
            'auditable_id' => $user->id
        ]);
    }

    /** @test */
    public function test_destroy_softDeletesUser(): void
    {
        // Arrange
        $user = User::factory()->create();
        
        // Act
        $response = $this->actingAs($this->adminUser)
            ->deleteJson("/api/v1/users/{$user->id}");
        
        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'User deleted successfully'
            ]);
        
        $this->assertSoftDeleted('users', ['id' => $user->id]);
    }

    /** @test */
    public function test_destroy_createsAuditLog_forDeletion(): void
    {
        // Arrange
        $user = User::factory()->create();
        
        // Act
        $this->actingAs($this->adminUser)
            ->deleteJson("/api/v1/users/{$user->id}");
        
        // Assert
        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $this->adminUser->id,
            'action' => 'deleted',
            'auditable_type' => User::class,
            'auditable_id' => $user->id
        ]);
    }

    /** @test */
    public function test_restore_restoresSoftDeletedUser(): void
    {
        // Arrange
        $user = User::factory()->create();
        $user->delete(); // Soft delete
        
        // Act
        $response = $this->actingAs($this->adminUser)
            ->postJson("/api/v1/users/{$user->id}/restore");
        
        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'User restored successfully'
            ]);
        
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'deleted_at' => null
        ]);
    }

    /** @test */
    public function test_assignRoles_assignsRolesToUser(): void
    {
        // Arrange
        $user = User::factory()->create();
        $managerRole = Role::create(['name' => 'Manager', 'guard_name' => 'web']);
        
        // Act
        $response = $this->actingAs($this->adminUser)
            ->postJson("/api/v1/users/{$user->id}/roles", [
                'roles' => ['Manager']
            ]);
        
        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Roles assigned successfully'
            ]);
        
        $this->assertTrue($user->fresh()->hasRole('Manager'));
    }

    /** @test */
    public function test_assignRoles_syncsRoles_replacingExisting(): void
    {
        // Arrange
        $user = User::factory()->create();
        $user->assignRole('User');
        
        $technicianRole = Role::create(['name' => 'Technician', 'guard_name' => 'web']);
        
        // Act
        $response = $this->actingAs($this->adminUser)
            ->postJson("/api/v1/users/{$user->id}/roles", [
                'roles' => ['Technician']
            ]);
        
        // Assert
        $response->assertStatus(200);
        
        $user->refresh();
        $this->assertFalse($user->hasRole('User'));
        $this->assertTrue($user->hasRole('Technician'));
    }

    /** @test */
    public function test_permissions_returnsUserPermissions(): void
    {
        // Arrange
        $user = User::factory()->create();
        $user->assignRole('Admin');
        
        // Act
        $response = $this->actingAs($this->adminUser)
            ->getJson("/api/v1/users/{$user->id}/permissions");
        
        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'direct_permissions',
                    'role_permissions',
                    'all_permissions'
                ],
                'message'
            ]);
        
        $this->assertIsArray($response->json('data.all_permissions'));
    }

    /** @test */
    public function test_index_requiresAuthentication(): void
    {
        // Act
        $response = $this->getJson('/api/v1/users');
        
        // Assert
        $response->assertStatus(401);
    }

    /** @test */
    public function test_store_requiresAuthentication(): void
    {
        // Arrange
        $userData = [
            'username' => 'testuser',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'first_name' => 'Test',
            'last_name' => 'User'
        ];
        
        // Act
        $response = $this->postJson('/api/v1/users', $userData);
        
        // Assert
        $response->assertStatus(401);
    }
}
