<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

/**
 * Departments Seeder
 * 
 * Seeds sample organizational structure
 */
class DepartmentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
            // TOP-LEVEL DEPARTMENTS
            [
                'name' => 'Information Technology',
                'code' => 'IT',
                'description' => 'Manages all IT infrastructure, systems, and support',
                'level' => 1,
                'email' => 'it@quty.co.id',
                'phone' => '+62-21-1234567',
                'location' => 'Building A',
                'floor' => 3,
                'annual_budget' => 500000000,
                'is_active' => true,
            ],
            [
                'name' => 'Human Resources',
                'code' => 'HR',
                'description' => 'Handles recruitment, employee relations, and development',
                'level' => 1,
                'email' => 'hr@quty.co.id',
                'phone' => '+62-21-1234568',
                'location' => 'Building A',
                'floor' => 2,
                'annual_budget' => 300000000,
                'is_active' => true,
            ],
            [
                'name' => 'Finance',
                'code' => 'FIN',
                'description' => 'Manages financial operations, budgets, and reporting',
                'level' => 1,
                'email' => 'finance@quty.co.id',
                'phone' => '+62-21-1234569',
                'location' => 'Building A',
                'floor' => 2,
                'annual_budget' => 400000000,
                'is_active' => true,
            ],
            [
                'name' => 'Operations',
                'code' => 'OPS',
                'description' => 'Daily operational activities and project management',
                'level' => 1,
                'email' => 'ops@quty.co.id',
                'phone' => '+62-21-1234570',
                'location' => 'Building B',
                'floor' => 1,
                'annual_budget' => 600000000,
                'is_active' => true,
            ],
            [
                'name' => 'Marketing',
                'code' => 'MKT',
                'description' => 'Marketing, branding, and customer engagement',
                'level' => 1,
                'email' => 'marketing@quty.co.id',
                'phone' => '+62-21-1234571',
                'location' => 'Building B',
                'floor' => 2,
                'annual_budget' => 450000000,
                'is_active' => true,
            ],
        ];

        foreach ($departments as $dept) {
            Department::create($dept);
        }

        // SUB-DEPARTMENTS (Level 2)
        $itDept = Department::where('code', 'IT')->first();
        if ($itDept) {
            Department::create([
                'name' => 'Infrastructure',
                'code' => 'IT-INF',
                'description' => 'Network, servers, and infrastructure management',
                'parent_id' => $itDept->id,
                'level' => 2,
                'email' => 'infrastructure@quty.co.id',
                'location' => 'Building A',
                'floor' => 3,
                'is_active' => true,
            ]);

            Department::create([
                'name' => 'Development',
                'code' => 'IT-DEV',
                'description' => 'Software development and application maintenance',
                'parent_id' => $itDept->id,
                'level' => 2,
                'email' => 'dev@quty.co.id',
                'location' => 'Building A',
                'floor' => 3,
                'is_active' => true,
            ]);

            Department::create([
                'name' => 'Support',
                'code' => 'IT-SUP',
                'description' => 'User support and helpdesk services',
                'parent_id' => $itDept->id,
                'level' => 2,
                'email' => 'support@quty.co.id',
                'location' => 'Building A',
                'floor' => 3,
                'is_active' => true,
            ]);
        }

        $hrDept = Department::where('code', 'HR')->first();
        if ($hrDept) {
            Department::create([
                'name' => 'Recruitment',
                'code' => 'HR-REC',
                'description' => 'Talent acquisition and recruitment',
                'parent_id' => $hrDept->id,
                'level' => 2,
                'email' => 'recruitment@quty.co.id',
                'location' => 'Building A',
                'floor' => 2,
                'is_active' => true,
            ]);

            Department::create([
                'name' => 'Training & Development',
                'code' => 'HR-TRN',
                'description' => 'Employee training and career development',
                'parent_id' => $hrDept->id,
                'level' => 2,
                'email' => 'training@quty.co.id',
                'location' => 'Building A',
                'floor' => 2,
                'is_active' => true,
            ]);
        }

        $this->command->info('✅ Departments seeded successfully!');
        $this->command->info('');
        $this->command->table(
            ['Department', 'Code', 'Level', 'Email'],
            Department::all()->map(function($dept) {
                return [
                    str_repeat('  ', $dept->level - 1) . $dept->name,
                    $dept->code,
                    $dept->level,
                    $dept->email
                ];
            })->toArray()
        );
    }
}
