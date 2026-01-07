<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_amenity_mapping', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meeting_room_id')->constrained('meeting_rooms')->onDelete('cascade');
            $table->foreignId('room_amenity_id')->constrained('room_amenities')->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['meeting_room_id', 'room_amenity_id']);
            $table->index('meeting_room_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_amenity_mapping');
    }
};
