<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class TestUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Superadmin
        User::firstOrCreate(
            ['email' => 'superadmin@imsquty.local'],
            [
                'username' => 'superadmin',
                'password' => bcrypt('superadmin'),
                'first_name' => 'Super',
                'last_name' => 'Admin',
                'phone' => '+1-800-SUPERADMIN',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        // Create Admin user
        User::firstOrCreate(
            ['email' => 'admin@imsquty.local'],
            [
                'username' => 'admin',
                'password' => bcrypt('admin'),
                'first_name' => 'Admin',
                'last_name' => 'User',
                'phone' => '+1-800-ADMIN',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        // Create Regular user
        User::firstOrCreate(
            ['email' => 'user@imsquty.local'],
            [
                'username' => 'user',
                'password' => bcrypt('user'),
                'first_name' => 'John',
                'last_name' => 'Doe',
                'phone' => '+1-800-USER',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('✅ Test users created successfully!');
        $this->command->table(
            ['Email', 'Username', 'Password'],
            [
                ['superadmin@imsquty.local', 'superadmin', 'superadmin'],
                ['admin@imsquty.local', 'admin', 'admin'],
                ['user@imsquty.local', 'user', 'user'],
            ]
        );
    }
}
