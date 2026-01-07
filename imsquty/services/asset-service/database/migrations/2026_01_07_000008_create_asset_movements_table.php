<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_movements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->unsignedBigInteger('asset_id');
            $table->enum('movement_type', ['deployment', 'relocation', 'return', 'disposal', 'repair-send', 'repair-return'])->default('relocation');
            
            // From/To locations
            $table->unsignedBigInteger('from_location_id')->nullable();
            $table->unsignedBigInteger('to_location_id')->nullable();
            
            // From/To users
            $table->unsignedBigInteger('from_user_id')->nullable();
            $table->unsignedBigInteger('to_user_id')->nullable();
            
            // Movement details
            $table->text('reason')->nullable();
            $table->datetime('movement_date');
            $table->unsignedBigInteger('approved_by_user_id')->nullable();
            $table->datetime('approved_at')->nullable();
            
            $table->timestamps();
            
            $table->index('asset_id');
            $table->index('movement_type');
            $table->index('movement_date');
            $table->index('from_location_id');
            $table->index('to_location_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_movements');
    }
};
