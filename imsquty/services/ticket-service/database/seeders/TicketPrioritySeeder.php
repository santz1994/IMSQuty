<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TicketPrioritySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('tickets_priorities')->insert([
            ['id' => 1, 'priority' => 'Low'],
            ['id' => 2, 'priority' => 'Medium'],
            ['id' => 3, 'priority' => 'High'],
        ]);
    }
}
