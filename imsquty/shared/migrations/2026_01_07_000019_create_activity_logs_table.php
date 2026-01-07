<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->unsignedBigInteger('user_id');
            $table->string('activity');
            $table->string('category'); // e.g., 'asset', 'ticket', 'booking'
            $table->text('description')->nullable();
            
            // Related Entity
            $table->string('related_model')->nullable();
            $table->string('related_id')->nullable();
            
            // Context
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('category');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
