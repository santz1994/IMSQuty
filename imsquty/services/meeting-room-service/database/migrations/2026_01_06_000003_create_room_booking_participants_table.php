<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_booking_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meeting_room_booking_id')->constrained('meeting_room_bookings')->onDelete('cascade');
            $table->unsignedBigInteger('user_id')->comment('User Service ID');
            $table->enum('status', ['invited', 'accepted', 'declined'])->default('invited');
            $table->timestamp('responded_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->unique(['meeting_room_booking_id', 'user_id']);
            $table->index('user_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_booking_participants');
    }
};
