<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Create Password Resets Table
 * 
 * Stores password reset tokens
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('password_resets', function (Blueprint $table) {
            $table->id();
            $table->string('email', 255)->index()->comment('User email');
            $table->string('token', 255)->comment('Reset token');
            $table->timestamp('created_at')->useCurrent()->comment('When token was created');
            $table->timestamp('expires_at')->nullable()->comment('When token expires');
            $table->boolean('used')->default(false)->comment('Whether token has been used');
            
            // Indexes
            $table->index(['email', 'token']);
            $table->index('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('password_resets');
    }
};
