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
            // TestUsersSeeder::class,    // 6. ⚠️ DISABLED FOR PRODUCTION - Test users with fake data
        ]);

        $this->command->info('');
        $this->command->info('🎉 Database seeding completed successfully!');
        $this->command->info('');
        $this->command->info('📝 Production Mode: Essential data seeded (roles, permissions, departments, teams)');
        $this->command->info('⚠️  Test users DISABLED - Use real user accounts from HR system');
        $this->command->info('');
        $this->command->info('Next steps:');
        $this->command->info('1. Import real users from HR system');
        $this->command->info('2. Assign roles to actual users');
        $this->command->info('3. Configure production authentication');
    }
}
