<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class QuickTestUsersSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            ['daniel@quty.co.id', 'Daniel', 'Rizaldy', 'developer'],
            ['superadmin@quty.co.id', 'Super', 'Admin', 'superadmin'],
            ['director@quty.co.id', 'John', 'Director', 'director'],
            ['manager@quty.co.id', 'Jane', 'Manager', 'manager'],
            ['hr@quty.co.id', 'Alice', 'HR', 'hr'],
            ['receptionist@quty.co.id', 'Bob', 'Receptionist', 'receptionist'],
            ['admin@quty.co.id', 'Charlie', 'Admin', 'admin'],
            ['user@quty.co.id', 'Diana', 'User', 'user'],
        ];

        foreach ($users as [$email, $firstName, $lastName, $roleName]) {
            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'password' => Hash::make('Password123!'),
                    'status' => 'active',
                    'created_by' => 1,
                ]
            );

            $role = Role::where('name', $roleName)->first();
            if ($role && !$user->hasRole($role)) {
                $user->assignRole($role);
                $this->command->info("✓ {$email} created with {$roleName} role");
            }
        }

        $this->command->info('✓ Test users seeded successfully!');
    }
}
