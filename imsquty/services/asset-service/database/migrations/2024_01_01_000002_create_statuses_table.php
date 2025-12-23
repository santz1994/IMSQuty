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
        Schema::create('statuses', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('code', 50)->nullable(); // Unique code (e.g., available, assigned)
            $table->string('category', 50)->nullable(); // Category of status (asset, general, etc.)
            $table->string('color', 20)->nullable(); // Color code for UI (#28a745, etc.)
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            // Audit trail (for Auditable trait - ISO 27001, GDPR, SOC2)
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('statuses');
    }
};
