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
        Schema::create('tickets_priorities', function (Blueprint $table) {
            $table->id();
            $table->string('priority', 50)->unique();
            $table->integer('sla_hours')->default(72);
            $table->string('color', 7)->default('#ffc107');
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets_priorities');
    }
};
