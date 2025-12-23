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
        Schema::create('asset_models', function (Blueprint $table) {
            $table->id();
            $table->string('asset_model', 100);
            $table->foreignId('asset_type_id')->constrained('asset_types')->onDelete('restrict');
            $table->unsignedBigInteger('manufacturer_id')->nullable(); // Cross-service reference (Master Data)
            $table->unsignedBigInteger('pcspec_id')->nullable(); // Cross-service reference (Master Data)
            $table->string('part_number', 100)->nullable();
            $table->text('notes')->nullable();
            // Audit trail (for Auditable trait - ISO 27001, GDPR, SOC2)
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('asset_model');
            $table->index('asset_type_id');
            $table->index('manufacturer_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_models');
    }
};
