<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_bookings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Reference
            $table->string('booking_reference')->unique();
            $table->unsignedBigInteger('room_id');
            
            // Dates/Times
            $table->date('booking_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->integer('duration_minutes'); // calculated
            
            // Attendees
            $table->unsignedBigInteger('booked_by_user_id');
            $table->text('attendees')->nullable(); // JSON array of user IDs
            $table->integer('expected_attendees')->nullable();
            
            // Status
            $table->enum('status', ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'])->default('confirmed');
            $table->enum('checkin_status', ['not-checked-in', 'checked-in', 'checked-out'])->default('not-checked-in');
            
            // Purpose
            $table->string('purpose');
            $table->text('description')->nullable();
            
            // Timestamps
            $table->datetime('checked_in_at')->nullable();
            $table->datetime('checked_out_at')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('room_id');
            $table->index('booking_date');
            $table->index('start_time');
            $table->index('status');
            $table->index('booked_by_user_id');
            $table->index('checkin_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_bookings');
    }
};
