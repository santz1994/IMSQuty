<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Create JWT Blacklist Table
 * 
 * Stores revoked JWT tokens for security
 * Tokens remain blacklisted until expiry
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('jwt_blacklist', function (Blueprint $table) {
            $table->id();
            $table->text('token')->comment('JWT token string');
            $table->unsignedBigInteger('user_id')->nullable()->comment('User who owned the token');
            $table->timestamp('revoked_at')->useCurrent()->comment('When token was revoked');
            $table->timestamp('expires_at')->nullable()->index()->comment('When token expires');
            $table->string('reason', 100)->nullable()->comment('Reason for revocation');
            
            // Foreign key
            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('set null');
            
            // Indexes
            $table->index('revoked_at');
            $table->index(['user_id', 'revoked_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jwt_blacklist');
    }
};
