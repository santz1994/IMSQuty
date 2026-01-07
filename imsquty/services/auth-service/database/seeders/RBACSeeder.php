<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RBACSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Seeds default roles and permissions for IMSQuty system
     */
    public function run(): void
    {
        // Clear existing RBAC data
        DB::table('role_has_permissions')->truncate();
        DB::table('model_has_permissions')->truncate();
        DB::table('model_has_roles')->truncate();
        DB::table('permissions')->truncate();
        DB::table('roles')->truncate();

        // ==================== PERMISSIONS ====================
        $permissions = [
            // Assets Module
            ['name' => 'assets.view', 'description' => 'View assets', 'group' => 'assets'],
            ['name' => 'assets.create', 'description' => 'Create new assets', 'group' => 'assets'],
            ['name' => 'assets.update', 'description' => 'Update existing assets', 'group' => 'assets'],
            ['name' => 'assets.delete', 'description' => 'Delete assets', 'group' => 'assets'],
            ['name' => 'assets.assign', 'description' => 'Assign assets to users', 'group' => 'assets'],
            ['name' => 'assets.maintenance.view', 'description' => 'View maintenance records', 'group' => 'assets'],
            ['name' => 'assets.maintenance.manage', 'description' => 'Manage maintenance schedules', 'group' => 'assets'],

            // Tickets Module
            ['name' => 'tickets.view', 'description' => 'View tickets', 'group' => 'tickets'],
            ['name' => 'tickets.create', 'description' => 'Create new tickets', 'group' => 'tickets'],
            ['name' => 'tickets.update', 'description' => 'Update tickets', 'group' => 'tickets'],
            ['name' => 'tickets.delete', 'description' => 'Delete tickets', 'group' => 'tickets'],
            ['name' => 'tickets.assign', 'description' => 'Assign tickets to technicians', 'group' => 'tickets'],
            ['name' => 'tickets.close', 'description' => 'Close/resolve tickets', 'group' => 'tickets'],

            // Meeting Rooms Module
            ['name' => 'rooms.view', 'description' => 'View meeting rooms', 'group' => 'rooms'],
            ['name' => 'rooms.create', 'description' => 'Create room bookings', 'group' => 'rooms'],
            ['name' => 'rooms.update', 'description' => 'Update own bookings', 'group' => 'rooms'],
            ['name' => 'rooms.delete', 'description' => 'Delete own bookings', 'group' => 'rooms'],
            ['name' => 'rooms.approve', 'description' => 'Approve room bookings', 'group' => 'rooms'],
            ['name' => 'rooms.manage', 'description' => 'Manage room configurations', 'group' => 'rooms'],

            // Users Module
            ['name' => 'users.view', 'description' => 'View users', 'group' => 'users'],
            ['name' => 'users.create', 'description' => 'Create new users', 'group' => 'users'],
            ['name' => 'users.update', 'description' => 'Update user information', 'group' => 'users'],
            ['name' => 'users.delete', 'description' => 'Delete users', 'group' => 'users'],
            ['name' => 'users.roles.assign', 'description' => 'Assign roles to users', 'group' => 'users'],
            ['name' => 'users.permissions.assign', 'description' => 'Assign direct permissions to users', 'group' => 'users'],

            // Roles & Permissions Management
            ['name' => 'roles.view', 'description' => 'View roles', 'group' => 'rbac'],
            ['name' => 'roles.create', 'description' => 'Create new roles', 'group' => 'rbac'],
            ['name' => 'roles.update', 'description' => 'Update roles', 'group' => 'rbac'],
            ['name' => 'roles.delete', 'description' => 'Delete roles', 'group' => 'rbac'],
            ['name' => 'permissions.view', 'description' => 'View permissions', 'group' => 'rbac'],
            ['name' => 'permissions.manage', 'description' => 'Manage permission assignments', 'group' => 'rbac'],

            // Financial Module
            ['name' => 'financials.view', 'description' => 'View financial data', 'group' => 'financials'],
            ['name' => 'financials.create', 'description' => 'Create financial records', 'group' => 'financials'],
            ['name' => 'financials.update', 'description' => 'Update financial records', 'group' => 'financials'],
            ['name' => 'financials.delete', 'description' => 'Delete financial records', 'group' => 'financials'],
            ['name' => 'financials.approve', 'description' => 'Approve expenses/invoices', 'group' => 'financials'],

            // Reporting Module
            ['name' => 'reports.view', 'description' => 'View reports', 'group' => 'reports'],
            ['name' => 'reports.generate', 'description' => 'Generate custom reports', 'group' => 'reports'],
            ['name' => 'reports.export', 'description' => 'Export reports', 'group' => 'reports'],
            ['name' => 'reports.schedule', 'description' => 'Schedule automated reports', 'group' => 'reports'],

            // Audit & Monitoring
            ['name' => 'audit.view', 'description' => 'View audit logs', 'group' => 'audit'],
            ['name' => 'audit.export', 'description' => 'Export audit logs', 'group' => 'audit'],

            // System Administration
            ['name' => 'system.settings.view', 'description' => 'View system settings', 'group' => 'system'],
            ['name' => 'system.settings.update', 'description' => 'Update system settings', 'group' => 'system'],
            ['name' => 'system.logs.view', 'description' => 'View system logs', 'group' => 'system'],
        ];

        $permissionIds = [];
        foreach ($permissions as $permission) {
            $permissionIds[$permission['name']] = DB::table('permissions')->insertGetId([
                'name' => $permission['name'],
                'guard_name' => 'web',
                'description' => $permission['description'],
                'group' => $permission['group'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // ==================== ROLES ====================
        $roles = [
            [
                'name' => 'Super Admin',
                'description' => 'Full system access - all permissions',
                'is_system' => true,
                'permissions' => array_keys($permissionIds), // ALL permissions
            ],
            [
                'name' => 'Admin',
                'description' => 'System administrator with most permissions',
                'is_system' => true,
                'permissions' => [
                    'assets.view', 'assets.create', 'assets.update', 'assets.delete', 'assets.assign',
                    'assets.maintenance.view', 'assets.maintenance.manage',
                    'tickets.view', 'tickets.create', 'tickets.update', 'tickets.assign', 'tickets.close',
                    'rooms.view', 'rooms.create', 'rooms.update', 'rooms.delete', 'rooms.approve', 'rooms.manage',
                    'users.view', 'users.create', 'users.update', 'users.roles.assign',
                    'roles.view', 'permissions.view',
                    'financials.view', 'financials.create', 'financials.update', 'financials.approve',
                    'reports.view', 'reports.generate', 'reports.export',
                    'audit.view',
                ],
            ],
            [
                'name' => 'Manager',
                'description' => 'Department manager with approval rights',
                'is_system' => false,
                'permissions' => [
                    'assets.view', 'assets.create', 'assets.update', 'assets.assign',
                    'tickets.view', 'tickets.create', 'tickets.update', 'tickets.assign',
                    'rooms.view', 'rooms.create', 'rooms.update', 'rooms.approve',
                    'users.view',
                    'financials.view', 'financials.approve',
                    'reports.view', 'reports.generate',
                ],
            ],
            [
                'name' => 'Technician',
                'description' => 'IT technician for ticket handling',
                'is_system' => false,
                'permissions' => [
                    'assets.view', 'assets.maintenance.view',
                    'tickets.view', 'tickets.update', 'tickets.close',
                    'rooms.view',
                ],
            ],
            [
                'name' => 'User',
                'description' => 'Standard user with basic permissions',
                'is_system' => true,
                'permissions' => [
                    'assets.view',
                    'tickets.view', 'tickets.create',
                    'rooms.view', 'rooms.create', 'rooms.update', 'rooms.delete',
                    'reports.view',
                ],
            ],
            [
                'name' => 'Finance',
                'description' => 'Finance team member',
                'is_system' => false,
                'permissions' => [
                    'assets.view',
                    'financials.view', 'financials.create', 'financials.update', 'financials.approve',
                    'reports.view', 'reports.generate', 'reports.export',
                ],
            ],
        ];

        foreach ($roles as $role) {
            $roleId = DB::table('roles')->insertGetId([
                'name' => $role['name'],
                'guard_name' => 'web',
                'description' => $role['description'],
                'is_system' => $role['is_system'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Assign permissions to role
            foreach ($role['permissions'] as $permissionName) {
                if (isset($permissionIds[$permissionName])) {
                    DB::table('role_has_permissions')->insert([
                        'role_id' => $roleId,
                        'permission_id' => $permissionIds[$permissionName],
                    ]);
                }
            }
        }

        $this->command->info('RBAC Seeder completed successfully!');
        $this->command->info('Created ' . count($permissions) . ' permissions');
        $this->command->info('Created ' . count($roles) . ' roles');
    }
}
