<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Create Login History Table
 * 
 * Tracks all login attempts (successful and failed) for security auditing
 * ISO 27001, GDPR, SOC 2 compliance
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('login_history', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable()->comment('User ID if login successful');
            $table->string('email', 255)->index()->comment('Email used for login attempt');
            $table->boolean('success')->default(false)->index()->comment('Whether login was successful');
            $table->string('ip_address', 45)->comment('IP address of the login attempt');
            $table->text('user_agent')->nullable()->comment('Browser user agent string');
            $table->timestamp('attempted_at')->useCurrent()->index()->comment('When the login attempt occurred');
            
            // Foreign key
            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('set null');
            
            // Indexes for performance
            $table->index(['email', 'success', 'attempted_at']);
            $table->index(['user_id', 'attempted_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('login_history');
    }
};
