<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use App\Models\User;
use Spatie\Permission\Models\Role;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;
    
    /**
     * Ensure required test database tables exist
     * RefreshDatabase trait drops and recreates tables, but some are created manually
     */
    protected function ensureTestTables(): void
    {
        $db = \DB::connection();
        
        // Create manufacturers table if it doesn't exist
        if (!$db->getSchemaBuilder()->hasTable('manufacturers')) {
            $db->statement('
                CREATE TABLE manufacturers (
                    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    country VARCHAR(50),
                    contact_email VARCHAR(100),
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    deleted_at TIMESTAMP NULL,
                    KEY deleted_at_idx (deleted_at)
                )
            ');
        }
        
        // Create pcspecs table if it doesn't exist
        if (!$db->getSchemaBuilder()->hasTable('pcspecs')) {
            $db->statement('
                CREATE TABLE pcspecs (
                    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100),
                    processor VARCHAR(100),
                    memory_gb INT,
                    storage_gb INT,
                    storage_type VARCHAR(50),
                    gpu VARCHAR(100),
                    display_size FLOAT,
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    deleted_at TIMESTAMP NULL,
                    KEY deleted_at_idx (deleted_at)
                )
            ');
        }
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

