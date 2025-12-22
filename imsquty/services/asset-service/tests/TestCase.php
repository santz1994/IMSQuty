<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Spatie\Permission\Models\Role;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        // Disable foreign key constraints for tests
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
    }
    
    protected function tearDown(): void
    {
        // Re-enable foreign key constraints
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        parent::tearDown();
    }
    
    /**
     * Seed default roles for testing
     */
    protected function seedRoles(): void
    {
        if (!Role::where('name', 'Admin')->where('guard_name', 'web')->exists()) {
            Role::create(['name' => 'Admin', 'guard_name' => 'web']);
        }
        if (!Role::where('name', 'User')->where('guard_name', 'web')->exists()) {
            Role::create(['name' => 'User', 'guard_name' => 'web']);
        }
    }
    
    /**
     * Create an authenticated user for testing
     * @return User
     */
    protected function createAuthenticatedUser(): User
    {
        // Ensure roles exist
        $this->seedRoles();
        
        // Get or create Admin role
        $role = Role::where('name', 'Admin')->where('guard_name', 'web')->firstOrCreate(
            ['name' => 'Admin', 'guard_name' => 'web'],
            ['name' => 'Admin', 'guard_name' => 'web']
        );
        $user = User::factory()->create([
            'username' => 'test_user_' . uniqid(),
            'email' => 'test_' . uniqid() . '@test.com',
        ]);
        $user->assignRole($role);
        return $user;
    }
}

