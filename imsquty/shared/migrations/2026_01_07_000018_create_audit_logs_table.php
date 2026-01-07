<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Entity
            $table->string('model');
            $table->string('model_id');
            
            // Action
            $table->enum('action', ['create', 'read', 'update', 'delete'])->default('update');
            
            // User
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('user_name')->nullable();
            $table->string('user_ip')->nullable();
            
            // Changes
            $table->text('old_values')->nullable(); // JSON
            $table->text('new_values')->nullable(); // JSON
            $table->text('description')->nullable();
            
            // Environment
            $table->string('user_agent')->nullable();
            $table->string('environment')->default('production');
            
            $table->timestamps();
            
            $table->index('model');
            $table->index('model_id');
            $table->index('action');
            $table->index('user_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
