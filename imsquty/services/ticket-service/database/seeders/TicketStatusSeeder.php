<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TicketStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('tickets_statuses')->insert([
            ['id' => 1, 'status' => 'Open'],
            ['id' => 2, 'status' => 'Pending'],
            ['id' => 3, 'status' => 'Resolved'],
        ]);
    }
}
