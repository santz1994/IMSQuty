<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_maintenance', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->unsignedBigInteger('asset_id');
            $table->enum('maintenance_type', ['preventive', 'corrective', 'emergency'])->default('preventive');
            $table->text('description');
            $table->text('findings')->nullable();
            
            // Scheduling
            $table->datetime('scheduled_at')->nullable();
            $table->datetime('started_at')->nullable();
            $table->datetime('completed_at')->nullable();
            
            // Details
            $table->unsignedBigInteger('performed_by_user_id');
            $table->unsignedBigInteger('vendor_id')->nullable();
            $table->decimal('cost', 12, 2)->nullable();
            $table->enum('status', ['scheduled', 'in-progress', 'completed', 'cancelled'])->default('scheduled');
            
            // Additional
            $table->text('parts_replaced')->nullable();
            $table->text('next_maintenance_notes')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('asset_id');
            $table->index('status');
            $table->index('maintenance_type');
            $table->index('scheduled_at');
            $table->index('performed_by_user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_maintenance');
    }
};
