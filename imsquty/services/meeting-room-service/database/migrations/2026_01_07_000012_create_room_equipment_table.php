<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_equipment', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('type', ['projector', 'screen', 'tv', 'whiteboard', 'conference-phone', 'camera', 'microphone', 'speaker', 'other'])->default('other');
            $table->string('model')->nullable();
            $table->string('serial_number')->nullable();
            
            // Condition
            $table->enum('condition', ['excellent', 'good', 'fair', 'poor', 'broken'])->default('good');
            $table->date('last_maintenance_date')->nullable();
            $table->date('next_maintenance_date')->nullable();
            
            // Status
            $table->boolean('is_operational')->default(true);
            $table->text('notes')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('type');
            $table->index('is_operational');
            $table->index('condition');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_equipment');
    }
};
