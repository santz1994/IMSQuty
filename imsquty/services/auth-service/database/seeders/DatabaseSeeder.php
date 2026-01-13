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
            TestUsersSeeder::class,       // 6. ✅ Create test users for development
        ]);

        $this->command->info('');
        $this->command->info('🎉 Database seeding completed successfully!');
        $this->command->info('');
        $this->command->info('✅ Development Mode: All data seeded including test users');
        $this->command->info('🔑 Test user: daniel@quty.co.id / Password123!');
        $this->command->info('');
        $this->command->info('Next steps:');
        $this->command->info('1. Test login with daniel@quty.co.id');
        $this->command->info('2. Verify RBAC permissions');
        $this->command->info('3. Start building features!');
    }
}
