<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('🌱 Starting database seeding...');
        $this->command->info('');

        // Order is important!
        $this->call([
            RolesSeeder::class,           // 1. Create 6 roles first
            PermissionsSeeder::class,     // 2. Create permissions
            RolePermissionSeeder::class,  // 3. Map permissions to roles
            DepartmentsSeeder::class,     // 4. Create departments
            TeamsSeeder::class,           // 5. Create teams
            TestUsersSeeder::class,       // 6. Create test users with role assignments
        ]);

        $this->command->info('');
        $this->command->info('🎉 Database seeding completed successfully!');
        $this->command->info('');
        $this->command->warn('⚠️  Test users created with default password: password123');
        $this->command->info('');
        $this->command->info('Next steps:');
        $this->command->info('1. Test login with any test user');
        $this->command->info('2. Verify role-based permissions');
        $this->command->info('3. Update default passwords in production');
    }
}
