<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

/**
 * Role Seeder
 * 
 * Seeds default roles and permissions for User Service
 * Based on 09_CUSTOM_ROADMAP.md requirements
 */
class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // User permissions
            'users.view',
            'users.create',
            'users.update',
            'users.delete',
            'users.restore',
            
            // Role permissions
            'roles.view',
            'roles.create',
            'roles.update',
            'roles.delete',
            
            // Division permissions
            'divisions.view',
            'divisions.create',
            'divisions.update',
            'divisions.delete',
            
            // Permission permissions
            'permissions.view',
            'permissions.assign',
            
            // Audit log permissions
            'audit-logs.view',
            
            // System settings
            'settings.view',
            'settings.update',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create roles and assign permissions
        
        // 1. Super Admin - All permissions
        $superAdmin = Role::firstOrCreate(['name' => 'Super Admin']);
        $superAdmin->syncPermissions(Permission::all());

        // 2. Admin - User, role, division management
        $admin = Role::firstOrCreate(['name' => 'Admin']);
        $admin->syncPermissions([
            'users.view',
            'users.create',
            'users.update',
            'users.delete',
            'roles.view',
            'roles.create',
            'roles.update',
            'divisions.view',
            'divisions.create',
            'divisions.update',
            'divisions.delete',
            'permissions.view',
            'audit-logs.view',
        ]);

        // 3. Management - Strategic management level
        $management = Role::firstOrCreate(['name' => 'Management']);
        $management->syncPermissions([
            'users.view',
            'users.create',
            'users.update',
            'divisions.view',
            'divisions.create',
            'divisions.update',
            'audit-logs.view',
            'settings.view',
        ]);

        // 4. Director - Senior management, view and approve
        $director = Role::firstOrCreate(['name' => 'Director']);
        $director->syncPermissions([
            'users.view',
            'users.update',
            'divisions.view',
            'audit-logs.view',
            'settings.view',
        ]);

        // 5. Manager - Department/team management
        $manager = Role::firstOrCreate(['name' => 'Manager']);
        $manager->syncPermissions([
            'users.view',
            'users.update',
            'divisions.view',
            'audit-logs.view',
        ]);

        // 6. Receptionist - Front desk, basic operations
        $receptionist = Role::firstOrCreate(['name' => 'Receptionist']);
        $receptionist->syncPermissions([
            'users.view',
            'divisions.view',
        ]);

        // 7. Technician - Technical staff
        $technician = Role::firstOrCreate(['name' => 'Technician']);
        $technician->syncPermissions([
            'users.view',
        ]);

        // 8. User - Basic user (view own profile only)
        $user = Role::firstOrCreate(['name' => 'User']);
        $user->syncPermissions([
            'users.view', // Can view own profile
        ]);

        $this->command->info('✅ Roles and permissions seeded successfully!');
        $this->command->info('');
        $this->command->table(
            ['Role', 'Permissions Count'],
            [
                ['Super Admin', $superAdmin->permissions->count() . ' (ALL)'],
                ['Admin', $admin->permissions->count()],
                ['Management', $management->permissions->count()],
                ['Director', $director->permissions->count()],
                ['Manager', $manager->permissions->count()],
                ['Receptionist', $receptionist->permissions->count()],
                ['Technician', $technician->permissions->count()],
                ['User', $user->permissions->count()],
            ]
        );
    }
}
