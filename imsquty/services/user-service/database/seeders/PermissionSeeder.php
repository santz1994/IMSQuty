<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Define permissions by module
        $permissions = [
            // Dashboard
            'view-dashboard',
            
            // User Management
            'view-users',
            'create-users',
            'edit-users',
            'delete-users',
            'restore-users',
            'assign-roles',
            'view-user-activity',
            
            // Role & Permission Management
            'view-roles',
            'create-roles',
            'edit-roles',
            'delete-roles',
            'view-permissions',
            'assign-permissions',
            
            // Asset Management
            'view-assets',
            'create-assets',
            'edit-assets',
            'delete-assets',
            'export-assets',
            'import-assets',
            'assign-assets',
            'transfer-assets',
            'maintenance-assets',
            
            // Ticket Management
            'view-tickets',
            'create-tickets',
            'edit-tickets',
            'delete-tickets',
            'assign-tickets',
            'close-tickets',
            'reopen-tickets',
            
            // Inventory Management
            'view-inventory',
            'create-inventory',
            'edit-inventory',
            'delete-inventory',
            'adjust-inventory',
            'transfer-inventory',
            'view-stock-levels',
            
            // Financial Management
            'view-financials',
            'create-transactions',
            'edit-transactions',
            'delete-transactions',
            'approve-transactions',
            'view-reports',
            'export-financials',
            
            // Meeting Room Management
            'view-meeting-rooms',
            'create-meeting-rooms',
            'edit-meeting-rooms',
            'delete-meeting-rooms',
            'book-meeting-rooms',
            'cancel-bookings',
            'approve-bookings',
            
            // Master Data Management
            'view-master-data',
            'create-master-data',
            'edit-master-data',
            'delete-master-data',
            
            // Reporting
            'view-reports',
            'create-reports',
            'export-reports',
            'schedule-reports',
            
            // Audit Logs
            'view-audit-logs',
            'export-audit-logs',
            
            // System Settings
            'view-settings',
            'edit-settings',
            'manage-cache',
            'manage-queue',
            'toggle-maintenance',
            
            // Notifications
            'view-notifications',
            'send-notifications',
            'manage-notification-templates',
        ];

        // Create all permissions
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission],
                ['guard_name' => 'web']
            );
        }

        $this->command->info('Permissions created successfully!');

        // Assign permissions to roles
        $this->assignPermissionsToRoles();
    }

    /**
     * Assign permissions to roles
     */
    private function assignPermissionsToRoles(): void
    {
        // Superadmin gets all permissions
        $superadmin = Role::where('name', 'superadmin')->first();
        if ($superadmin) {
            $superadmin->givePermissionTo(Permission::all());
            $this->command->info('All permissions assigned to superadmin');
        }

        // Admin gets most permissions except system-critical ones
        $admin = Role::where('name', 'admin')->first();
        if ($admin) {
            $adminPermissions = Permission::whereNotIn('name', [
                'delete-roles',
                'assign-permissions',
                'toggle-maintenance',
            ])->get();
            $admin->givePermissionTo($adminPermissions);
            $this->command->info('Permissions assigned to admin');
        }

        // Manager gets read and moderate permissions
        $manager = Role::where('name', 'manager')->first();
        if ($manager) {
            $managerPermissions = Permission::where('name', 'like', 'view-%')
                ->orWhere('name', 'like', 'edit-%')
                ->orWhere('name', 'like', 'create-%')
                ->orWhere('name', 'like', 'assign-%')
                ->orWhere('name', 'like', 'approve-%')
                ->get();
            $manager->givePermissionTo($managerPermissions);
            $this->command->info('Permissions assigned to manager');
        }

        // User gets basic read permissions
        $user = Role::where('name', 'user')->first();
        if ($user) {
            $userPermissions = Permission::whereIn('name', [
                'view-dashboard',
                'view-assets',
                'view-tickets',
                'create-tickets',
                'view-inventory',
                'view-meeting-rooms',
                'book-meeting-rooms',
                'view-notifications',
            ])->get();
            $user->givePermissionTo($userPermissions);
            $this->command->info('Permissions assigned to user');
        }
    }
}
