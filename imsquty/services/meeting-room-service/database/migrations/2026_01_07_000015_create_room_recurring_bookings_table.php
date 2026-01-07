<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_recurring_bookings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->unsignedBigInteger('room_id');
            $table->time('start_time');
            $table->time('end_time');
            $table->text('day_of_week'); // JSON array: ['Monday', 'Wednesday', 'Friday']
            
            // Dates
            $table->date('start_date');
            $table->date('end_date')->nullable();
            
            // Organizer
            $table->unsignedBigInteger('organized_by_user_id');
            $table->string('purpose');
            $table->text('description')->nullable();
            
            // Status
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('room_id');
            $table->index('start_date');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_recurring_bookings');
    }
};
