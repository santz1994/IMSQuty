<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Team;
use Illuminate\Database\Seeder;

/**
 * Teams Seeder
 * 
 * Seeds sample teams within departments
 */
class TeamsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // IT Department Teams
        $itInfra = Department::where('code', 'IT-INF')->first();
        if ($itInfra) {
            Team::create([
                'name' => 'Network Team',
                'code' => 'IT-INF-NET',
                'description' => 'Network infrastructure and connectivity',
                'department_id' => $itInfra->id,
                'team_type' => 'operational',
                'email' => 'network@quty.co.id',
                'is_active' => true,
            ]);

            Team::create([
                'name' => 'Server Team',
                'code' => 'IT-INF-SRV',
                'description' => 'Server management and maintenance',
                'department_id' => $itInfra->id,
                'team_type' => 'operational',
                'email' => 'servers@quty.co.id',
                'is_active' => true,
            ]);
        }

        $itDev = Department::where('code', 'IT-DEV')->first();
        if ($itDev) {
            Team::create([
                'name' => 'Backend Team',
                'code' => 'IT-DEV-BE',
                'description' => 'Backend API and services development',
                'department_id' => $itDev->id,
                'team_type' => 'operational',
                'email' => 'backend@quty.co.id',
                'slack_channel' => '#backend-team',
                'is_active' => true,
            ]);

            Team::create([
                'name' => 'Frontend Team',
                'code' => 'IT-DEV-FE',
                'description' => 'UI/UX and frontend development',
                'department_id' => $itDev->id,
                'team_type' => 'operational',
                'email' => 'frontend@quty.co.id',
                'slack_channel' => '#frontend-team',
                'is_active' => true,
            ]);

            Team::create([
                'name' => 'Mobile Team',
                'code' => 'IT-DEV-MOB',
                'description' => 'Mobile application development',
                'department_id' => $itDev->id,
                'team_type' => 'operational',
                'email' => 'mobile@quty.co.id',
                'slack_channel' => '#mobile-team',
                'is_active' => true,
            ]);
        }

        $itSupport = Department::where('code', 'IT-SUP')->first();
        if ($itSupport) {
            Team::create([
                'name' => 'Helpdesk L1',
                'code' => 'IT-SUP-HD1',
                'description' => 'Level 1 helpdesk support',
                'department_id' => $itSupport->id,
                'team_type' => 'operational',
                'email' => 'helpdesk-l1@quty.co.id',
                'is_active' => true,
            ]);

            Team::create([
                'name' => 'Helpdesk L2',
                'code' => 'IT-SUP-HD2',
                'description' => 'Level 2 technical support',
                'department_id' => $itSupport->id,
                'team_type' => 'operational',
                'email' => 'helpdesk-l2@quty.co.id',
                'is_active' => true,
            ]);
        }

        // HR Department Teams
        $hrRec = Department::where('code', 'HR-REC')->first();
        if ($hrRec) {
            Team::create([
                'name' => 'Tech Recruitment',
                'code' => 'HR-REC-TECH',
                'description' => 'IT and technical hiring',
                'department_id' => $hrRec->id,
                'team_type' => 'operational',
                'email' => 'tech-recruitment@quty.co.id',
                'is_active' => true,
            ]);
        }

        // Operations Teams
        $ops = Department::where('code', 'OPS')->first();
        if ($ops) {
            Team::create([
                'name' => 'Project Alpha',
                'code' => 'OPS-PROJ-ALPHA',
                'description' => 'Project Alpha implementation team',
                'department_id' => $ops->id,
                'team_type' => 'project',
                'start_date' => now()->subMonths(3),
                'end_date' => now()->addMonths(6),
                'email' => 'project-alpha@quty.co.id',
                'is_active' => true,
            ]);

            Team::create([
                'name' => 'Quality Assurance',
                'code' => 'OPS-QA',
                'description' => 'Quality control and testing',
                'department_id' => $ops->id,
                'team_type' => 'operational',
                'email' => 'qa@quty.co.id',
                'is_active' => true,
            ]);
        }

        $this->command->info('✅ Teams seeded successfully!');
        $this->command->info('');
        $this->command->table(
            ['Team', 'Code', 'Type', 'Department'],
            Team::with('department')->get()->map(function($team) {
                return [
                    $team->name,
                    $team->code,
                    ucfirst($team->team_type),
                    $team->department->name
                ];
            })->toArray()
        );
    }
}
