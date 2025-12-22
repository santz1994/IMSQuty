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
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('action', 50); // LOGIN, LOGOUT, CREATE, UPDATE, DELETE
            $table->string('resource', 100); // auth, user, ticket, etc.
            $table->unsignedBigInteger('resource_id')->nullable(); // ID of the resource
            $table->json('old_values')->nullable(); // Before change
            $table->json('new_values')->nullable(); // After change
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamp('created_at');
            
            $table->index('user_id');
            $table->index('action');
            $table->index(['resource', 'resource_id']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
