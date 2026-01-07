<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Seeder;

/**
 * Role Permission Seeder
 * 
 * Maps permissions to roles according to the 6-level hierarchy
 */
class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // LEVEL 1: SUPERADMIN - ALL PERMISSIONS
        $superadmin = Role::where('name', 'superadmin')->first();
        if ($superadmin) {
            $allPermissions = Permission::all()->pluck('id')->toArray();
            $superadmin->permissions()->sync($allPermissions);
            $this->command->info("✅ Superadmin: {$superadmin->permissions()->count()} permissions (ALL)");
        }

        // LEVEL 2: DIRECTOR - Strategic & Business
        $director = Role::where('name', 'director')->first();
        if ($director) {
            $directorPerms = Permission::whereIn('group', [
                'user', 'asset', 'ticket', 'room', 'financial', 'hr', 'report', 'audit'
            ])->whereNotIn('name', [
                'system.config.all',
                'system.database.all',
                'system.deploy.all',
                'system.security.all',
            ])->pluck('id')->toArray();
            
            $director->permissions()->sync($directorPerms);
            $this->command->info("✅ Director: {$director->permissions()->count()} permissions");
        }

        // LEVEL 3: MANAGER - Team Operations
        $manager = Role::where('name', 'manager')->first();
        if ($manager) {
            $managerPerms = Permission::where(function($query) {
                $query->where('name', 'like', '%.view.%')
                      ->orWhere('name', 'like', '%.team')
                      ->orWhere('name', 'like', '%.approve.team')
                      ->orWhere('name', 'like', '%.assign.team');
            })->orWhereIn('name', [
                'user.update.team',
                'ticket.create.all',
                'ticket.assign.team',
                'ticket.resolve.all',
                'asset.view.department',
                'booking.create.all',
                'booking.approve.all',
                'leave.approve.team',
                'report.view.operational',
            ])->pluck('id')->toArray();
            
            $manager->permissions()->sync($managerPerms);
            $this->command->info("✅ Manager: {$manager->permissions()->count()} permissions");
        }

        // LEVEL 4A: ADMIN - Module Management
        $admin = Role::where('name', 'admin')->first();
        if ($admin) {
            $adminPerms = Permission::whereIn('group', [
                'user', 'asset', 'ticket', 'room', 'inventory', 'report'
            ])->where('name', 'not like', '%.own')
              ->whereNotIn('name', [
                'user.delete.all',
                'asset.delete.all',
                'budget.approve.all',
            ])->pluck('id')->toArray();
            
            $admin->permissions()->sync($adminPerms);
            $this->command->info("✅ Admin: {$admin->permissions()->count()} permissions");
        }

        // LEVEL 4B: HR - Human Resources
        $hr = Role::where('name', 'hr')->first();
        if ($hr) {
            $hrPerms = Permission::where('group', 'hr')
                ->orWhereIn('name', [
                    'user.view.all',
                    'user.create.all',
                    'user.update.all',
                    'employee.create.all',
                    'employee.view.all',
                    'employee.update.all',
                    'employee.delete.all',
                    'leave.view.all',
                    'leave.approve.all',
                    'recruitment.manage.all',
                    'performance.view.all',
                    'report.view.operational',
                ])->pluck('id')->toArray();
            
            $hr->permissions()->sync($hrPerms);
            $this->command->info("✅ HR: {$hr->permissions()->count()} permissions");
        }

        // LEVEL 5: USER - End User Operations
        $user = Role::where('name', 'user')->first();
        if ($user) {
            $userPerms = Permission::whereIn('name', [
                'user.view.own',
                'user.update.own',
                'asset.view.own',
                'ticket.create.all',
                'ticket.view.own',
                'booking.create.all',
                'booking.view.own',
                'leave.submit.own',
                'leave.view.own',
                'report.view.own',
            ])->pluck('id')->toArray();
            
            $user->permissions()->sync($userPerms);
            $this->command->info("✅ User: {$user->permissions()->count()} permissions");
        }

        $this->command->info('');
        $this->command->info('🎉 All role-permission mappings completed!');
        
        // Summary table
        $this->command->table(
            ['Role', 'Level', 'Permissions', 'Access Scope'],
            [
                ['Superadmin', '1', $superadmin->permissions()->count(), 'Everything'],
                ['Director', '2', $director->permissions()->count(), 'Strategic + Business'],
                ['Manager', '3', $manager->permissions()->count(), 'Department/Team'],
                ['Admin', '4', $admin->permissions()->count(), 'Module Operations'],
                ['HR', '4', $hr->permissions()->count(), 'HR Operations'],
                ['User', '5', $user->permissions()->count(), 'Personal + Create'],
            ]
        );
    }
}
