<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

/**
 * Roles Seeder - 7-Level Role Hierarchy
 * 
 * Seeds the 7 roles for IMSQuty with hierarchy:
 * 0. Developer (System Architect - daniel@quty.co.id)
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
                'name' => 'developer',
                'guard_name' => 'api',
                'description' => 'System Developer & Architect - Highest level access for system development and architecture. Reserved for daniel@quty.co.id.',
                'is_system' => true,
                'level' => 0,
            ],
            [
                'name' => 'superadmin',
                'guard_name' => 'api',
                'description' => 'Pengguna dengan akses tertinggi dalam sistem IT. Mengelola infrastruktur, keamanan, database, dan konfigurasi sistem.',
                'is_system' => true,
                'level' => 1,
            ],
            [
                'name' => 'director',
                'guard_name' => 'api',
                'description' => 'Eksekutif dengan tanggung jawab strategis perusahaan. Menentukan kebijakan dan strategi bisnis.',
                'is_system' => true,
                'level' => 2,
            ],
            [
                'name' => 'manager',
                'guard_name' => 'api',
                'description' => 'Pimpinan tim/departemen yang mengelola operasional tim dan melakukan approval level-1.',
                'is_system' => true,
                'level' => 3,
            ],
            [
                'name' => 'admin',
                'guard_name' => 'api',
                'description' => 'Pengguna dengan akses terbatas untuk mengelola modul tertentu dan mendukung operasional harian.',
                'is_system' => true,
                'level' => 5,
            ],
            [
                'name' => 'hr',
                'guard_name' => 'api',
                'description' => 'Tim yang mengelola sumber daya manusia termasuk rekrutmen, cuti, dan data karyawan.',
                'is_system' => true,
                'level' => 4,
            ],
            [
                'name' => 'receptionist',
                'guard_name' => 'api',
                'description' => 'Receptionist dengan akses khusus untuk mengelola meeting room dan penjadwalan.',
                'is_system' => true,
                'level' => 5,
            ],
            [
                'name' => 'user',
                'guard_name' => 'api',
                'description' => 'Pengguna biasa atau staf yang menggunakan sistem untuk tugas harian seperti membuat tiket dan melihat aset.',
                'is_system' => true,
                'level' => 6,
            ],
        ];

        foreach ($roles as $roleData) {
            Role::updateOrCreate(
                ['name' => $roleData['name'], 'guard_name' => $roleData['guard_name']],
                $roleData
            );
        }

        $this->command->info('✅ 7 Roles seeded successfully with hierarchy!');
        $this->command->table(
            ['Level', 'Role', 'Description'],
            [
                ['0', 'developer', 'System Developer & Architect (daniel@quty.co.id)'],
                ['1', 'superadmin', 'IT Infrastructure Control'],
                ['2', 'director', 'Strategic Business Decisions'],
                ['3', 'manager', 'Team Operations'],
                ['4', 'hr', 'Human Resources'],
                ['5', 'admin', 'Module Management'],
                ['5', 'receptionist', 'Meeting Room Management'],
                ['6', 'user', 'End User Operations'],
            ]
        );
    }
}
