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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200);
            $table->text('message');
            $table->string('type', 50); // Info, Warning, Error, Success
            $table->string('channel', 50); // Email, SMS, Push, Database
            $table->string('priority', 50); // Urgent, High, Normal, Low
            $table->string('status', 50); // Pending, Sent, Failed
            $table->unsignedBigInteger('recipient_id'); // User Service (no FK)
            $table->string('recipient_email', 100)->nullable();
            $table->string('recipient_phone', 50)->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->text('error_message')->nullable();
            $table->json('metadata')->nullable();
            $table->unsignedBigInteger('created_by')->nullable(); // User Service
            $table->unsignedBigInteger('updated_by')->nullable(); // User Service
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('recipient_id');
            $table->index('type');
            $table->index('channel');
            $table->index('status');
            $table->index('is_read');
            $table->index('sent_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
