<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_depreciation_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->unsignedBigInteger('asset_id');
            $table->decimal('original_cost', 14, 2);
            $table->decimal('current_value', 14, 2);
            $table->decimal('depreciation_amount', 14, 2);
            $table->decimal('depreciation_rate', 5, 2); // percentage
            
            // Depreciation method
            $table->enum('method', ['straight-line', 'declining-balance', 'sum-of-years'])->default('straight-line');
            
            // Dates
            $table->date('purchase_date');
            $table->integer('useful_life_years');
            $table->date('end_of_life_date')->nullable();
            
            // Status
            $table->enum('status', ['in-use', 'fully-depreciated', 'disposed'])->default('in-use');
            $table->datetime('calculated_at');
            
            $table->timestamps();
            
            $table->index('asset_id');
            $table->index('status');
            $table->index('calculated_at');
            $table->index('end_of_life_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_depreciation_logs');
    }
};
