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
        Schema::create('movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->onDelete('cascade');
            
            // Cross-service references (no FK constraints)
            $table->unsignedBigInteger('from_location_id')->nullable(); // Master Data Service
            $table->unsignedBigInteger('to_location_id')->nullable(); // Master Data Service
            $table->unsignedBigInteger('from_user_id')->nullable(); // User Service
            $table->unsignedBigInteger('to_user_id')->nullable(); // User Service
            $table->unsignedBigInteger('moved_by'); // User Service
            
            $table->text('notes')->nullable();
            $table->timestamp('moved_at');
            $table->timestamps();
            
            $table->index('asset_id');
            $table->index('moved_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('movements');
    }
};
