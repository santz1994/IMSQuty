<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TicketTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('tickets_types')->insert([
            ['id' => 1, 'type' => 'Incident'],
            ['id' => 2, 'type' => 'Problem'],
            ['id' => 3, 'type' => 'Loan'],
        ]);
    }
}
