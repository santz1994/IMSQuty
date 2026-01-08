<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ⚠️ PRODUCTION MODE: Test/fake data disabled
        
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);
        
        $this->command->info('✅ Master Data Service: Production mode - no test data seeded');
        $this->command->info('📝 Add production master data seeders here (statuses, categories, etc.)');
    }
}
