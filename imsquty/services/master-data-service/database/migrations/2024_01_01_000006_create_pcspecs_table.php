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
        Schema::create('pcspecs', function (Blueprint $table) {
            $table->id();
            $table->string('name', 200);
            $table->string('cpu', 100);
            $table->integer('ram_gb');
            $table->string('storage', 100)->nullable();
            $table->string('gpu', 100)->nullable();
            $table->string('motherboard', 100)->nullable();
            $table->string('psu', 100)->nullable();
            $table->string('case_type', 50)->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pcspecs');
    }
};
