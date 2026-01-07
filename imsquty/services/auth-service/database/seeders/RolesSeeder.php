<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

/**
 * Roles Seeder - 6-Level Role Hierarchy
 * 
 * Seeds the 6 roles for IMSQuty:
 * 1. Superadmin (IT Infrastructure)
 * 2. Director (Strategic Business)
 * 3. Manager (Team Operations)
 * 4. Admin (Module Management)
 * 5. HR (Human Resources)
 * 6. User (End User)
 */
class RolesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'superadmin',
                'guard_name' => 'api',
                'description' => 'Pengguna dengan akses tertinggi dalam sistem IT. Mengelola infrastruktur, keamanan, database, dan konfigurasi sistem.',
                'is_system' => true,
            ],
            [
                'name' => 'director',
                'guard_name' => 'api',
                'description' => 'Eksekutif dengan tanggung jawab strategis perusahaan. Menentukan kebijakan dan strategi bisnis.',
                'is_system' => true,
            ],
            [
                'name' => 'manager',
                'guard_name' => 'api',
                'description' => 'Pimpinan tim/departemen yang mengelola operasional tim dan melakukan approval level-1.',
                'is_system' => true,
            ],
            [
                'name' => 'admin',
                'guard_name' => 'api',
                'description' => 'Pengguna dengan akses terbatas untuk mengelola modul tertentu dan mendukung operasional harian.',
                'is_system' => true,
            ],
            [
                'name' => 'hr',
                'guard_name' => 'api',
                'description' => 'Tim yang mengelola sumber daya manusia termasuk rekrutmen, cuti, dan data karyawan.',
                'is_system' => true,
            ],
            [
                'name' => 'user',
                'guard_name' => 'api',
                'description' => 'Pengguna biasa atau staf yang menggunakan sistem untuk tugas harian seperti membuat tiket dan melihat aset.',
                'is_system' => true,
            ],
        ];

        foreach ($roles as $roleData) {
            Role::updateOrCreate(
                ['name' => $roleData['name'], 'guard_name' => $roleData['guard_name']],
                $roleData
            );
        }

        $this->command->info('✅ 6 Roles seeded successfully!');
        $this->command->table(
            ['Role', 'Description'],
            [
                ['superadmin', 'IT Infrastructure Control (Level 1)'],
                ['director', 'Strategic Business Decisions (Level 2)'],
                ['manager', 'Team Operations (Level 3)'],
                ['admin', 'Module Management (Level 4)'],
                ['hr', 'Human Resources (Level 4)'],
                ['user', 'End User Operations (Level 5)'],
            ]
        );
    }
}
