<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('damage_reports', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Basic Information
            $table->string('ticket_number')->unique();
            $table->unsignedBigInteger('asset_id')->nullable();
            $table->string('asset_tag')->nullable();
            $table->text('description');
            $table->text('symptoms')->nullable();
            
            // Classification
            $table->enum('severity', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->enum('status', ['new', 'assigned', 'in-progress', 'on-hold', 'resolved', 'closed'])->default('new');
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->string('category')->nullable();
            
            // Assignment
            $table->unsignedBigInteger('reported_by_user_id');
            $table->unsignedBigInteger('assigned_to_user_id')->nullable();
            $table->datetime('assigned_at')->nullable();
            
            // SLA
            $table->unsignedBigInteger('sla_policy_id')->nullable();
            $table->datetime('sla_due_date')->nullable();
            $table->boolean('sla_breached')->default(false);
            
            // Resolution
            $table->text('resolution_notes')->nullable();
            $table->datetime('resolved_at')->nullable();
            $table->datetime('closed_at')->nullable();
            
            // Audit
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index('ticket_number');
            $table->index('asset_id');
            $table->index('status');
            $table->index('severity');
            $table->index('priority');
            $table->index('reported_by_user_id');
            $table->index('assigned_to_user_id');
            $table->index('sla_breached');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('damage_reports');
    }
};
