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
        Schema::create('meeting_rooms', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('code', 20)->unique()->comment('Room code for easy reference');
            $table->unsignedBigInteger('location_id')->nullable()->comment('FK to locations table');
            $table->string('floor', 50)->nullable();
            $table->string('building', 100)->nullable();
            $table->unsignedInteger('capacity')->default(0)->comment('Maximum number of people');
            $table->text('description')->nullable();
            $table->json('facilities')->nullable()->comment('Array of facilities: projector, whiteboard, etc.');
            $table->json('equipment')->nullable()->comment('Array of equipment: TV, sound system, etc.');
            $table->decimal('hourly_rate', 10, 2)->default(0)->comment('Cost per hour if applicable');
            $table->enum('status', ['available', 'maintenance', 'unavailable'])->default('available');
            $table->string('image')->nullable()->comment('Room photo URL');
            $table->text('notes')->nullable()->comment('Additional notes or instructions');
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('status');
            $table->index('location_id');
            $table->index('capacity');
            $table->index('code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meeting_rooms');
    }
};
