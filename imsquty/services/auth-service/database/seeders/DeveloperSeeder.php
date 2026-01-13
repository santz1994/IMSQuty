<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Developer Account Seeder
 * 
 * Creates the system developer account for daniel@quty.co.id
 * This account has the highest level (Level 0) access
 */
class DeveloperSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create developer user
        $developer = User::updateOrCreate(
            ['email' => 'daniel@quty.co.id'],
            [
                'username' => 'daniel',
                'first_name' => 'Daniel',
                'last_name' => 'Rizaldy',
                'email' => 'daniel@quty.co.id',
                'password' => Hash::make('Dev@2026!Secure'), // Change this password!
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        // Get or create developer role
        $developerRole = Role::where('name', 'developer')->first();
        
        if (!$developerRole) {
            $this->command->error('❌ Developer role not found! Run RolesSeeder first.');
            return;
        }

        // Assign developer role
        if (!$developer->hasRole('developer')) {
            $developer->assignRole('developer');
            $this->command->info('✅ Assigned Developer role to daniel@quty.co.id');
        }

        // Give ALL permissions to developer
        $developer->syncPermissions(\App\Models\Permission::all());
        $this->command->info('✅ Granted all permissions to Developer');

        $this->command->info('');
        $this->command->line('========================================');
        $this->command->info('🎉 Developer Account Created Successfully!');
        $this->command->line('========================================');
        $this->command->table(
            ['Field', 'Value'],
            [
                ['Email', 'daniel@quty.co.id'],
                ['Username', 'daniel'],
                ['Name', 'Daniel Rizaldy'],
                ['Role', 'Developer (Level 0)'],
                ['Permissions', 'ALL (' . \App\Models\Permission::count() . ' permissions)'],
                ['Status', 'Active'],
            ]
        );
        $this->command->line('========================================');
        $this->command->warn('⚠️  IMPORTANT: Change the default password immediately!');
        $this->command->line('Default password: Dev@2026!Secure');
        $this->command->line('========================================');
    }
}
