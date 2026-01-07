<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_booking_feedback', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->uuid('room_booking_id');
            $table->unsignedBigInteger('user_id');
            
            // Ratings (1-5)
            $table->integer('room_cleanliness_rating')->nullable();
            $table->integer('equipment_functionality_rating')->nullable();
            $table->integer('comfort_rating')->nullable();
            $table->integer('overall_satisfaction_rating')->nullable();
            
            // Feedback
            $table->text('comments')->nullable();
            $table->text('issues_reported')->nullable();
            
            // Resolution
            $table->enum('issue_status', ['reported', 'assigned', 'in-progress', 'resolved'])->nullable()->default(null);
            $table->date('resolution_date')->nullable();
            
            $table->timestamps();
            
            $table->index('room_booking_id');
            $table->index('user_id');
            $table->index('overall_satisfaction_rating');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_booking_feedback');
    }
};
