<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_depreciation', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->onDelete('cascade');
            $table->decimal('original_value', 15, 2);
            $table->decimal('current_value', 15, 2);
            $table->decimal('depreciation_rate', 5, 2)->default(0);
            $table->enum('depreciation_method', ['straight_line', 'declining_balance'])->default('straight_line');
            $table->integer('useful_life_years')->default(5);
            $table->date('depreciation_start_date');
            $table->decimal('annual_depreciation', 15, 2)->nullable();
            $table->timestamps();
            
            $table->index('asset_id');
            $table->index('current_value');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_depreciation');
    }
};
