<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

/**
 * Permissions Seeder - 60+ Granular Permissions
 * 
 * Permissions follow format: {module}.{action}.{scope}
 * Scopes: all, department, team, own
 */
class PermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            // ==================== SYSTEM INFRASTRUCTURE ====================
            ['name' => 'system.config.all', 'group' => 'system', 'description' => 'Configure system settings'],
            ['name' => 'system.database.all', 'group' => 'system', 'description' => 'Database management'],
            ['name' => 'system.backup.all', 'group' => 'system', 'description' => 'Backup/restore operations'],
            ['name' => 'system.deploy.all', 'group' => 'system', 'description' => 'Deploy code/migrations'],
            ['name' => 'system.logs.all', 'group' => 'system', 'description' => 'View system logs'],
            ['name' => 'system.monitoring.all', 'group' => 'system', 'description' => 'Access monitoring tools'],
            ['name' => 'system.security.all', 'group' => 'system', 'description' => 'Security configuration'],

            // ==================== ROLE & PERMISSION MANAGEMENT ====================
            ['name' => 'role.create.all', 'group' => 'rbac', 'description' => 'Create new roles'],
            ['name' => 'role.update.all', 'group' => 'rbac', 'description' => 'Update roles'],
            ['name' => 'role.delete.all', 'group' => 'rbac', 'description' => 'Delete roles'],
            ['name' => 'role.assign.all', 'group' => 'rbac', 'description' => 'Assign roles to users'],
            ['name' => 'permission.create.all', 'group' => 'rbac', 'description' => 'Create permissions'],
            ['name' => 'permission.update.all', 'group' => 'rbac', 'description' => 'Update permissions'],
            ['name' => 'permission.delete.all', 'group' => 'rbac', 'description' => 'Delete permissions'],

            // ==================== USER MANAGEMENT ====================
            ['name' => 'user.create.all', 'group' => 'user', 'description' => 'Create any user'],
            ['name' => 'user.view.all', 'group' => 'user', 'description' => 'View all users'],
            ['name' => 'user.view.department', 'group' => 'user', 'description' => 'View department users'],
            ['name' => 'user.view.team', 'group' => 'user', 'description' => 'View team users'],
            ['name' => 'user.view.own', 'group' => 'user', 'description' => 'View own profile'],
            ['name' => 'user.update.all', 'group' => 'user', 'description' => 'Update any user'],
            ['name' => 'user.update.team', 'group' => 'user', 'description' => 'Update team members'],
            ['name' => 'user.update.own', 'group' => 'user', 'description' => 'Update own profile'],
            ['name' => 'user.delete.all', 'group' => 'user', 'description' => 'Delete users'],

            // ==================== ASSET MANAGEMENT ====================
            ['name' => 'asset.create.all', 'group' => 'asset', 'description' => 'Create assets'],
            ['name' => 'asset.view.all', 'group' => 'asset', 'description' => 'View all assets'],
            ['name' => 'asset.view.department', 'group' => 'asset', 'description' => 'View department assets'],
            ['name' => 'asset.view.own', 'group' => 'asset', 'description' => 'View assigned assets'],
            ['name' => 'asset.update.all', 'group' => 'asset', 'description' => 'Update any asset'],
            ['name' => 'asset.update.department', 'group' => 'asset', 'description' => 'Update department assets'],
            ['name' => 'asset.delete.all', 'group' => 'asset', 'description' => 'Delete assets'],
            ['name' => 'asset.approve.all', 'group' => 'asset', 'description' => 'Approve asset requests'],

            // ==================== TICKET MANAGEMENT ====================
            ['name' => 'ticket.create.all', 'group' => 'ticket', 'description' => 'Create tickets'],
            ['name' => 'ticket.view.all', 'group' => 'ticket', 'description' => 'View all tickets'],
            ['name' => 'ticket.view.department', 'group' => 'ticket', 'description' => 'View department tickets'],
            ['name' => 'ticket.view.own', 'group' => 'ticket', 'description' => 'View own tickets'],
            ['name' => 'ticket.assign.all', 'group' => 'ticket', 'description' => 'Assign tickets'],
            ['name' => 'ticket.assign.team', 'group' => 'ticket', 'description' => 'Assign to team'],
            ['name' => 'ticket.resolve.all', 'group' => 'ticket', 'description' => 'Resolve tickets'],
            ['name' => 'ticket.close.all', 'group' => 'ticket', 'description' => 'Close tickets'],

            // ==================== MEETING ROOM BOOKING ====================
            ['name' => 'room.create.all', 'group' => 'room', 'description' => 'Create rooms'],
            ['name' => 'room.view.all', 'group' => 'room', 'description' => 'View all rooms'],
            ['name' => 'room.update.all', 'group' => 'room', 'description' => 'Update rooms'],
            ['name' => 'room.delete.all', 'group' => 'room', 'description' => 'Delete rooms'],
            ['name' => 'booking.create.all', 'group' => 'room', 'description' => 'Create bookings'],
            ['name' => 'booking.view.all', 'group' => 'room', 'description' => 'View all bookings'],
            ['name' => 'booking.view.own', 'group' => 'room', 'description' => 'View own bookings'],
            ['name' => 'booking.approve.all', 'group' => 'room', 'description' => 'Approve bookings'],
            ['name' => 'booking.cancel.all', 'group' => 'room', 'description' => 'Cancel any booking'],

            // ==================== FINANCIAL ====================
            ['name' => 'budget.view.all', 'group' => 'financial', 'description' => 'View all budgets'],
            ['name' => 'budget.create.all', 'group' => 'financial', 'description' => 'Create budget'],
            ['name' => 'budget.approve.all', 'group' => 'financial', 'description' => 'Approve budget'],
            ['name' => 'invoice.create.all', 'group' => 'financial', 'description' => 'Create invoices'],
            ['name' => 'invoice.view.all', 'group' => 'financial', 'description' => 'View invoices'],
            ['name' => 'invoice.approve.all', 'group' => 'financial', 'description' => 'Approve invoices'],
            ['name' => 'expense.create.all', 'group' => 'financial', 'description' => 'Record expenses'],

            // ==================== HR OPERATIONS ====================
            ['name' => 'employee.create.all', 'group' => 'hr', 'description' => 'Add employees'],
            ['name' => 'employee.view.all', 'group' => 'hr', 'description' => 'View all employees'],
            ['name' => 'employee.update.all', 'group' => 'hr', 'description' => 'Update employees'],
            ['name' => 'employee.delete.all', 'group' => 'hr', 'description' => 'Remove employees'],
            ['name' => 'leave.view.all', 'group' => 'hr', 'description' => 'View all leaves'],
            ['name' => 'leave.view.own', 'group' => 'hr', 'description' => 'View own leaves'],
            ['name' => 'leave.submit.own', 'group' => 'hr', 'description' => 'Submit leave request'],
            ['name' => 'leave.approve.all', 'group' => 'hr', 'description' => 'Approve leaves'],
            ['name' => 'leave.approve.team', 'group' => 'hr', 'description' => 'Approve team leaves'],
            ['name' => 'recruitment.manage.all', 'group' => 'hr', 'description' => 'Manage recruitment'],
            ['name' => 'performance.view.all', 'group' => 'hr', 'description' => 'View performance reviews'],

            // ==================== INVENTORY ====================
            ['name' => 'inventory.create.all', 'group' => 'inventory', 'description' => 'Add inventory items'],
            ['name' => 'inventory.view.all', 'group' => 'inventory', 'description' => 'View inventory'],
            ['name' => 'inventory.update.all', 'group' => 'inventory', 'description' => 'Update inventory'],
            ['name' => 'inventory.delete.all', 'group' => 'inventory', 'description' => 'Delete inventory'],
            ['name' => 'stock.transfer.all', 'group' => 'inventory', 'description' => 'Transfer stock'],

            // ==================== REPORTS ====================
            ['name' => 'report.view.executive', 'group' => 'report', 'description' => 'Executive reports'],
            ['name' => 'report.view.operational', 'group' => 'report', 'description' => 'Operational reports'],
            ['name' => 'report.view.own', 'group' => 'report', 'description' => 'Personal reports'],
            ['name' => 'report.export.all', 'group' => 'report', 'description' => 'Export reports'],

            // ==================== AUDIT & COMPLIANCE ====================
            ['name' => 'audit.view.all', 'group' => 'audit', 'description' => 'View audit logs'],
            ['name' => 'compliance.manage.all', 'group' => 'audit', 'description' => 'Manage compliance'],
        ];

        foreach ($permissions as $permData) {
            Permission::updateOrCreate(
                ['name' => $permData['name'], 'guard_name' => 'api'],
                array_merge($permData, ['guard_name' => 'api'])
            );
        }

        $count = count($permissions);
        $this->command->info("✅ {$count} Permissions seeded successfully!");
        
        // Group count
        $groups = array_count_values(array_column($permissions, 'group'));
        $this->command->table(
            ['Module', 'Permissions'],
            array_map(function($group, $count) {
                return [$group, $count];
            }, array_keys($groups), $groups)
        );
    }
}
