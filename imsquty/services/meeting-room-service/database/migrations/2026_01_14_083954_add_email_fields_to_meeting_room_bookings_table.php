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
        Schema::table('meeting_room_bookings', function (Blueprint $table) {
            $table->json('participant_emails')->nullable()->after('attendees_list')->comment('Emails of external participants to receive notifications');
            $table->boolean('email_sent')->default(false)->after('participant_emails')->comment('Track if initial booking confirmation email sent');
            $table->boolean('approval_email_sent')->default(false)->after('email_sent')->comment('Track if approval/rejection email sent');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('meeting_room_bookings', function (Blueprint $table) {
            $table->dropColumn(['participant_emails', 'email_sent', 'approval_email_sent']);
        });
    }
};
