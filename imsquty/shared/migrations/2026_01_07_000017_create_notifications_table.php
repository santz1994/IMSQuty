<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->unsignedBigInteger('user_id');
            $table->string('title');
            $table->text('message');
            $table->enum('type', ['info', 'warning', 'error', 'success', 'ticket', 'asset', 'booking'])->default('info');
            
            // Related Entity
            $table->string('related_model')->nullable();
            $table->string('related_id')->nullable();
            $table->string('action_url')->nullable();
            
            // Status
            $table->boolean('is_read')->default(false);
            $table->datetime('read_at')->nullable();
            
            // Delivery
            $table->enum('channel', ['in-app', 'email', 'sms', 'push'])->default('in-app');
            $table->boolean('is_sent')->default(true);
            
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('is_read');
            $table->index('type');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
