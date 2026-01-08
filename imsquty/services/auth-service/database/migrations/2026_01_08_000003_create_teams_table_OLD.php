<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations - Create teams table
     */
    public function up(): void
    {
        Schema::create('teams', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('code', 20)->unique();
            $table->text('description')->nullable();
            
            // Department relationship
            $table->foreignId('department_id')->constrained('departments')->onDelete('cascade');
            
            // Team Leader/Manager
            $table->foreignId('manager_id')->nullable()->constrained('users')->onDelete('set null');
            
            // Team details
            $table->string('team_type', 50)->default('operational'); // operational, project, temporary
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable(); // For temporary/project teams
            
            // Contact
            $table->string('email', 100)->nullable();
            $table->string('slack_channel', 50)->nullable();
            $table->string('teams_channel', 50)->nullable();
            
            // Metrics
            $table->unsignedInteger('member_count')->default(0);
            $table->decimal('performance_score', 5, 2)->nullable(); // 0.00 - 100.00
            
            // Status
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index('code');
            $table->index('department_id');
            $table->index('team_type');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teams');
    }
};
