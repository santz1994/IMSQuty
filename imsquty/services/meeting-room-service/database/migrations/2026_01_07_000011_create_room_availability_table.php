<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_availability', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->unsignedBigInteger('room_id');
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('is_available')->default(true);
            $table->text('reason_unavailable')->nullable();
            
            $table->timestamps();
            
            $table->unique(['room_id', 'date', 'start_time', 'end_time']);
            $table->index('room_id');
            $table->index('date');
            $table->index('is_available');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_availability');
    }
};
