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
        Schema::create('asset_types', function (Blueprint $table) {
            $table->id();
            $table->string('type_name', 100)->nullable(); // Legacy monolith field, map from 'name'
            $table->string('name', 100)->nullable(); // Primary name field
            $table->string('code', 50)->nullable(); // Unique code (e.g., DESKTOP)
            $table->string('icon', 100)->nullable(); // Icon class or image path
            $table->text('description')->nullable();
            $table->boolean('spare')->default(false);
            $table->boolean('is_active')->default(true);
            // Audit trail (for Auditable trait - ISO 27001, GDPR, SOC2)
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('type_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_types');
    }
};
