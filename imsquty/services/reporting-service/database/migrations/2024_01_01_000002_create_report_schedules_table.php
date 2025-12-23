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
        Schema::create('report_schedules', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('report_type', 50); // Asset, Ticket, Financial, Inventory, User, Custom
            $table->string('frequency', 50); // Daily, Weekly, Monthly, Quarterly, Yearly, Custom
            $table->json('parameters')->nullable(); // Schedule parameters
            $table->string('format', 50); // PDF, Excel, CSV, JSON
            $table->json('recipients')->nullable(); // Email recipients
            $table->timestamp('last_run_at')->nullable();
            $table->timestamp('next_run_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('report_type');
            $table->index('frequency');
            $table->index('is_active');
            $table->index('next_run_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_schedules');
    }
};
