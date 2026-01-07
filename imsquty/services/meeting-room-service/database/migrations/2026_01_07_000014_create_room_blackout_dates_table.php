<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_blackout_dates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->unsignedBigInteger('room_id');
            $table->datetime('start_datetime');
            $table->datetime('end_datetime');
            $table->enum('reason', ['maintenance', 'cleaning', 'event', 'unavailable', 'other'])->default('unavailable');
            $table->text('description')->nullable();
            
            $table->unsignedBigInteger('created_by_user_id');
            $table->boolean('is_recurring')->default(false);
            $table->string('recurring_pattern')->nullable(); // e.g., 'weekly', 'monthly'
            
            $table->timestamps();
            
            $table->index('room_id');
            $table->index('start_datetime');
            $table->index('end_datetime');
            $table->index('reason');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_blackout_dates');
    }
};
