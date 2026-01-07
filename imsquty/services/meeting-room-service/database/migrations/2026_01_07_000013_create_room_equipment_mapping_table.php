<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_equipment_mapping', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->unsignedBigInteger('room_id');
            $table->uuid('equipment_id');
            $table->boolean('is_optional')->default(false);
            $table->integer('quantity')->default(1);
            $table->text('notes')->nullable();
            
            $table->timestamps();
            
            $table->unique(['room_id', 'equipment_id']);
            $table->index('room_id');
            $table->foreign('equipment_id')->references('id')->on('room_equipment')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_equipment_mapping');
    }
};
