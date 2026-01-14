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
        Schema::create('meeting_room_bookings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('meeting_room_id');
            $table->unsignedBigInteger('user_id')->comment('User who created the booking');
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->text('purpose')->nullable()->comment('Meeting purpose');
            $table->dateTime('start_time');
            $table->dateTime('end_time');
            $table->unsignedInteger('attendees_count')->default(0);
            $table->json('attendees_list')->nullable()->comment('Array of attendee user IDs or names');
            $table->json('participant_emails')->nullable()->comment('Emails of external participants to receive notifications');
            $table->boolean('email_sent')->default(false)->comment('Track if initial booking confirmation email sent');
            $table->boolean('approval_email_sent')->default(false)->comment('Track if approval/rejection email sent');
            $table->text('special_requirements')->nullable()->comment('Catering, setup requirements, etc.');
            $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled', 'completed'])->default('pending');
            $table->unsignedBigInteger('approved_by')->nullable()->comment('User ID who approved');
            $table->timestamp('approved_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Foreign keys
            $table->foreign('meeting_room_id')->references('id')->on('meeting_rooms')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');

            // Indexes
            $table->index('status');
            $table->index('start_time');
            $table->index('end_time');
            $table->index('meeting_room_id');
            $table->index('user_id');
            $table->index(['start_time', 'end_time']); // Composite index for time-based queries
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meeting_room_bookings');
    }
};
