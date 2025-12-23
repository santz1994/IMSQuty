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
        Schema::create('maintenance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->onDelete('cascade');
            $table->string('maintenance_type', 100); // Repair, Upgrade, Inspection, etc.
            $table->text('description');
            $table->decimal('cost', 15, 2)->default(0);
            $table->unsignedBigInteger('performed_by'); // User Service (no FK constraint)
            $table->timestamp('performed_at');
            $table->text('notes')->nullable();
            // Audit trail (for Auditable trait - ISO 27001, GDPR, SOC2)
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('asset_id');
            $table->index('maintenance_type');
            $table->index('performed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_logs');
    }
};
