<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_warranty', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->unsignedBigInteger('asset_id');
            $table->string('warranty_type');
            $table->datetime('start_date');
            $table->datetime('end_date');
            $table->boolean('is_active')->default(true);
            
            // Provider
            $table->unsignedBigInteger('vendor_id')->nullable();
            $table->string('warranty_number')->nullable();
            $table->text('coverage_details')->nullable();
            
            // Cost
            $table->decimal('warranty_cost', 12, 2)->nullable();
            $table->boolean('is_extended')->default(false);
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('asset_id');
            $table->index('end_date');
            $table->index('is_active');
            $table->index('is_extended');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_warranty');
    }
};
