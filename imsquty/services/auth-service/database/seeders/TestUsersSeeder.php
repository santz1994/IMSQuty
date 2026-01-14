<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\Department;
use App\Models\Team;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Test Users Seeder
 * 
 * Creates test users for each role with proper department/team assignments
 */
class TestUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get departments and teams
        $itDept = Department::where('code', 'IT')->first();
        $itInfraDept = Department::where('code', 'IT-INF')->first();
        $itDevDept = Department::where('code', 'IT-DEV')->first();
        $hrDept = Department::where('code', 'HR')->first();
        $opsDept = Department::where('code', 'OPS')->first();
        $networkTeam = Team::where('code', 'IT-INF-NET')->first();
        $backendTeam = Team::where('code', 'IT-DEV-BE')->first();
        $helpdeskTeam = Team::where('code', 'IT-SUP-HD1')->first();
        $qaTeam = Team::where('code', 'OPS-QA')->first();

        // LEVEL 0: Developer (System Architect - daniel@quty.co.id)
        $daniel = User::updateOrCreate(
            ['email' => 'daniel@quty.co.id'],
            [
                'username' => 'daniel',
                'password' => Hash::make('Password123!'),
                'first_name' => 'Daniel',
                'last_name' => 'Rizaldy',
                'phone' => '+62-812-8741-2570',
                'department_id' => $itDevDept?->id,
                'team_id' => $backendTeam?->id,
                'position' => 'System Architect & Lead Developer',
                'bio' => 'System architect and lead developer with full system access',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );
        if (!$daniel->hasRole('developer')) {
            $daniel->assignRole('developer');
        }

        // LEVEL 1: Superadmin (IT Infrastructure)
        $superadmin = User::updateOrCreate(
            ['email' => 'superadmin@quty.co.id'],
            [
                'username' => 'superadmin',
                'password' => Hash::make('Password123!'),
                'first_name' => 'System',
                'last_name' => 'Administrator',
                'phone' => '+62-812-1234-0001',
                'department_id' => $itInfraDept?->id,
                'team_id' => $networkTeam?->id,
                'position' => 'Chief Technology Officer',
                'bio' => 'Responsible for all IT infrastructure and system administration',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );
        if (!$superadmin->hasRole('superadmin')) {
            $superadmin->assignRole('superadmin');
        }

        // LEVEL 2: Director (Strategic Business)
        $director = User::updateOrCreate(
            ['email' => 'director@quty.co.id'],
            [
                'username' => 'director',
                'password' => Hash::make('Password123!'),
                'first_name' => 'Budi',
                'last_name' => 'Santoso',
                'phone' => '+62-812-1234-0002',
                'department_id' => $itDept?->id,
                'position' => 'IT Director',
                'bio' => 'Oversees IT strategy and business operations',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );
        if (!$director->hasRole('director')) {
            $director->assignRole('director');
        }

        // Update department director
        if ($itDept) {
            $itDept->update(['director_id' => $director->id]);
        }

        // LEVEL 3: Manager (Team Operations)
        $manager = User::updateOrCreate(
            ['email' => 'manager@quty.co.id'],
            [
                'username' => 'manager',
                'password' => Hash::make('Password123!'),
                'first_name' => 'Siti',
                'last_name' => 'Rahma',
                'phone' => '+62-812-1234-0003',
                'department_id' => $itDevDept?->id,
                'team_id' => $backendTeam?->id,
                'position' => 'Development Manager',
                'bio' => 'Leads backend development team',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );
        if (!$manager->hasRole('manager')) {
            $manager->assignRole('manager');
        }

        // Update department and team manager
        if ($itDevDept) {
            $itDevDept->update(['manager_id' => $manager->id]);
        }
        if ($backendTeam) {
            $backendTeam->update(['manager_id' => $manager->id]);
        }

        // LEVEL 5A: Admin (Module Management)
        $admin = User::updateOrCreate(
            ['email' => 'admin@quty.co.id'],
            [
                'username' => 'admin',
                'password' => Hash::make('Password123!'),
                'first_name' => 'Ahmad',
                'last_name' => 'Wijaya',
                'phone' => '+62-812-1234-0004',
                'department_id' => $itDevDept?->id,
                'team_id' => $backendTeam?->id,
                'position' => 'System Administrator',
                'bio' => 'Manages system modules and user support',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );
        if (!$admin->hasRole('admin')) {
            $admin->assignRole('admin');
        }

        // LEVEL 5B: Receptionist (Meeting Room Management)
        $receptionist = User::updateOrCreate(
            ['email' => 'receptionist@quty.co.id'],
            [
                'username' => 'receptionist',
                'password' => Hash::make('Password123!'),
                'first_name' => 'Lina',
                'last_name' => 'Kusuma',
                'phone' => '+62-812-1234-0010',
                'department_id' => $opsDept?->id,
                'position' => 'Front Office Receptionist',
                'bio' => 'Manages meeting room bookings and front office operations',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );
        if (!$receptionist->hasRole('receptionist')) {
            $receptionist->assignRole('receptionist');
        }

        // LEVEL 4: HR (Human Resources)
        $hr = User::updateOrCreate(
            ['email' => 'hr@quty.co.id'],
            [
                'username' => 'hr',
                'password' => Hash::make('Password123!'),
                'first_name' => 'Dewi',
                'last_name' => 'Lestari',
                'phone' => '+62-812-1234-0005',
                'department_id' => $hrDept?->id,
                'position' => 'HR Manager',
                'bio' => 'Manages employee data and HR operations',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );
        if (!$hr->hasRole('hr')) {
            $hr->assignRole('hr');
        }

        // Update HR department manager
        if ($hrDept) {
            $hrDept->update(['manager_id' => $hr->id]);
        }

        // LEVEL 6: User (End User)
        $user = User::updateOrCreate(
            ['email' => 'user@quty.co.id'],
            [
                'username' => 'user',
                'password' => Hash::make('Password123!'),
                'first_name' => 'Rudi',
                'last_name' => 'Hartono',
                'phone' => '+62-812-1234-0006',
                'department_id' => $opsDept?->id,
                'team_id' => $qaTeam?->id,
                'position' => 'QA Tester',
                'bio' => 'Quality assurance and testing',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );
        if (!$user->hasRole('user')) {
            $user->assignRole('user');
        }

        // Additional developers for testing
        $dev1 = User::updateOrCreate(
            ['email' => 'dev1@quty.co.id'],
            [
                'username' => 'developer1',
                'password' => Hash::make('password123'),
                'first_name' => 'Andi',
                'last_name' => 'Prasetyo',
                'phone' => '+62-812-1234-0007',
                'department_id' => $itDevDept?->id,
                'team_id' => $backendTeam?->id,
                'position' => 'Senior Backend Developer',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );
        if (!$dev1->hasRole('user')) {
            $dev1->assignRole('user');
        }

        $dev2 = User::updateOrCreate(
            ['email' => 'dev2@quty.co.id'],
            [
                'username' => 'developer2',
                'password' => Hash::make('password123'),
                'first_name' => 'Rina',
                'last_name' => 'Kurnia',
                'phone' => '+62-812-1234-0008',
                'department_id' => $itDevDept?->id,
                'team_id' => $backendTeam?->id,
                'position' => 'Backend Developer',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );
        if (!$dev2->hasRole('user')) {
            $dev2->assignRole('user');
        }

        // Helpdesk staff
        $helpdesk = User::updateOrCreate(
            ['email' => 'helpdesk@quty.co.id'],
            [
                'username' => 'helpdesk',
                'password' => Hash::make('password123'),
                'first_name' => 'Yanti',
                'last_name' => 'Susanti',
                'phone' => '+62-812-1234-0009',
                'department_id' => $itInfraDept?->id,
                'team_id' => $helpdeskTeam?->id,
                'position' => 'Helpdesk Support',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );
        if (!$helpdesk->hasRole('user')) {
            $helpdesk->assignRole('user');
        }

        $this->command->info('✅ Test users created successfully!');
        $this->command->info('');
        $this->command->warn('⚠️  ALL DEFAULT PASSWORDS: Password123!');
        $this->command->info('🔐 Force password change on first login recommended');
        $this->command->info('');
        $this->command->table(
            ['Username', 'Email', 'Role', 'Department', 'Team'],
            [
                ['daniel', 'daniel@quty.co.id', 'Developer (Level 0)', $itDevDept?->name ?? 'N/A', $backendTeam?->name ?? 'N/A'],
                ['superadmin', 'superadmin@quty.co.id', 'Superadmin (Level 1)', $itInfraDept?->name ?? 'N/A', $networkTeam?->name ?? 'N/A'],
                ['director', 'director@quty.co.id', 'Director (Level 2)', $itDept?->name ?? 'N/A', '-'],
                ['manager', 'manager@quty.co.id', 'Manager (Level 3)', $itDevDept?->name ?? 'N/A', $backendTeam?->name ?? 'N/A'],
                ['hr', 'hr@quty.co.id', 'HR (Level 4)', $hrDept?->name ?? 'N/A', '-'],
                ['admin', 'admin@quty.co.id', 'Admin (Level 5)', $itDevDept?->name ?? 'N/A', $backendTeam?->name ?? 'N/A'],
                ['receptionist', 'receptionist@quty.co.id', 'Receptionist (Level 5)', $opsDept?->name ?? 'N/A', '-'],
                ['user', 'user@quty.co.id', 'User (Level 6)', $opsDept?->name ?? 'N/A', $qaTeam?->name ?? 'N/A'],
                ['developer1', 'dev1@quty.co.id', 'User', $itDevDept?->name ?? 'N/A', $backendTeam?->name ?? 'N/A'],
                ['developer2', 'dev2@quty.co.id', 'User', $itDevDept?->name ?? 'N/A', $backendTeam?->name ?? 'N/A'],
                ['helpdesk', 'helpdesk@quty.co.id', 'User', $itInfraDept?->name ?? 'N/A', $helpdeskTeam?->name ?? 'N/A'],
            ]
        );
    }
}
