<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations - Create departments table with hierarchical structure
     */
    public function up(): void
    {
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique();
            $table->string('code', 20)->unique();
            $table->text('description')->nullable();
            
            // Hierarchical structure (nested set model)
            $table->foreignId('parent_id')->nullable()->constrained('departments')->onDelete('cascade');
            $table->unsignedInteger('level')->default(1); // 1 = top-level, 2 = sub-department, etc.
            
            // Leadership
            $table->foreignId('manager_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('director_id')->nullable()->constrained('users')->onDelete('set null');
            
            // Contact & Location
            $table->string('email', 100)->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('location', 100)->nullable();
            $table->integer('floor')->nullable();
            $table->string('building', 50)->nullable();
            
            // Budget & Resources
            $table->decimal('annual_budget', 15, 2)->nullable();
            $table->unsignedInteger('employee_count')->default(0);
            
            // Status
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index('code');
            $table->index('parent_id');
            $table->index('level');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('departments');
    }
};
