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

        // Create divisions table for validation
        if (!$db->getSchemaBuilder()->hasTable('divisions')) {
            $db->statement('
                CREATE TABLE divisions (
                    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    code VARCHAR(20),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    deleted_at TIMESTAMP NULL,
                    KEY deleted_at_idx (deleted_at)
                )
            ');
        }

        // Create locations table for validation
        if (!$db->getSchemaBuilder()->hasTable('locations')) {
            $db->statement('
                CREATE TABLE locations (
                    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    code VARCHAR(20),
                    type VARCHAR(50),
                    address TEXT,
                    city VARCHAR(50),
                    state VARCHAR(50),
                    country VARCHAR(50),
                    postal_code VARCHAR(10),
                    phone VARCHAR(20),
                    parent_id BIGINT UNSIGNED NULL,
                    is_active BOOLEAN DEFAULT 1,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    deleted_at TIMESTAMP NULL,
                    KEY deleted_at_idx (deleted_at)
                )
            ');
        }

        // Create suppliers table for validation
        if (!$db->getSchemaBuilder()->hasTable('suppliers')) {
            $db->statement('
                CREATE TABLE suppliers (
                    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    code VARCHAR(20),
                    contact_email VARCHAR(100),
                    contact_phone VARCHAR(20),
                    address TEXT,
                    city VARCHAR(50),
                    state VARCHAR(50),
                    country VARCHAR(50),
                    postal_code VARCHAR(10),
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    deleted_at TIMESTAMP NULL,
                    KEY deleted_at_idx (deleted_at)
                )
            ');
        }

        // Create warranty_types table for validation
        if (!$db->getSchemaBuilder()->hasTable('warranty_types')) {
            $db->statement('
                CREATE TABLE warranty_types (
                    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    coverage_months INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    deleted_at TIMESTAMP NULL,
                    KEY deleted_at_idx (deleted_at)
                )
            ');
        }

        // Create invoices table for validation
        if (!$db->getSchemaBuilder()->hasTable('invoices')) {
            $db->statement('
                CREATE TABLE invoices (
                    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    invoice_number VARCHAR(50) NOT NULL UNIQUE,
                    supplier_id BIGINT UNSIGNED,
                    amount DECIMAL(15,2),
                    invoice_date DATE,
                    due_date DATE,
                    status VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    deleted_at TIMESTAMP NULL,
                    KEY deleted_at_idx (deleted_at)
                )
            ');
        }

        // Create purchase_orders table for validation
        if (!$db->getSchemaBuilder()->hasTable('purchase_orders')) {
            $db->statement('
                CREATE TABLE purchase_orders (
                    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    po_number VARCHAR(50) NOT NULL UNIQUE,
                    supplier_id BIGINT UNSIGNED,
                    amount DECIMAL(15,2),
                    order_date DATE,
                    delivery_date DATE,
                    status VARCHAR(50),
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
     * Seed foreign key test data (manufacturers, pcspecs, etc.)
     */
    protected function seedForeignKeyData(): void
    {
        $db = \DB::connection();
        
        // Seed manufacturers
        if ($db->table('manufacturers')->count() === 0) {
            $db->table('manufacturers')->insert([
                ['id' => 1, 'name' => 'Dell', 'country' => 'USA'],
                ['id' => 2, 'name' => 'HP', 'country' => 'USA'],
                ['id' => 3, 'name' => 'Lenovo', 'country' => 'China'],
                ['id' => 4, 'name' => 'LG', 'country' => 'South Korea'],
                ['id' => 5, 'name' => 'Cisco', 'country' => 'USA'],
                ['id' => 6, 'name' => 'TP-Link', 'country' => 'China'],
            ]);
        }
        
        // Seed pcspecs
        if ($db->table('pcspecs')->count() === 0) {
            $db->table('pcspecs')->insert([
                ['id' => 1, 'name' => 'High Performance', 'processor' => 'Intel i7', 'memory_gb' => 16, 'storage_gb' => 512],
                ['id' => 2, 'name' => 'Standard', 'processor' => 'Intel i5', 'memory_gb' => 8, 'storage_gb' => 256],
                ['id' => 3, 'name' => 'Budget', 'processor' => 'Intel Celeron', 'memory_gb' => 4, 'storage_gb' => 128],
            ]);
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

