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
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->string('asset_tag', 50)->unique();
            $table->string('name', 200)->nullable();
            $table->string('qr_code', 100)->unique()->nullable();
            $table->string('serial_number', 100)->unique()->nullable();
            
            // Foreign keys (local tables)
            $table->foreignId('model_id')->nullable()->constrained('asset_models')->onDelete('set null');
            $table->foreignId('status_id')->nullable()->constrained('statuses')->onDelete('set null');
            $table->unsignedBigInteger('movement_id')->nullable(); // Latest movement (no FK to avoid circular dependency)
            
            // Cross-service references (no FK constraints in microservices)
            $table->unsignedBigInteger('division_id')->nullable(); // Master Data Service
            $table->unsignedBigInteger('location_id')->nullable(); // Master Data Service
            $table->unsignedBigInteger('supplier_id')->nullable(); // Master Data Service
            $table->unsignedBigInteger('warranty_type_id')->nullable(); // Master Data Service
            $table->unsignedBigInteger('assigned_to')->nullable(); // User Service
            $table->unsignedBigInteger('invoice_id')->nullable(); // Financial Service
            $table->unsignedBigInteger('purchase_order_id')->nullable(); // Financial Service
            
            // Asset details
            $table->text('notes')->nullable();
            $table->string('ip_address', 50)->nullable();
            $table->string('mac_address', 50)->nullable();
            
            // Purchase & warranty info
            $table->date('purchase_date')->nullable();
            $table->integer('warranty_months')->default(0);
            
            // Audit trail (for Auditable trait - ISO 27001, GDPR, SOC2)
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->unsignedBigInteger('deleted_by')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index('asset_tag');
            $table->index('serial_number');
            $table->index('qr_code');
            $table->index('status_id');
            $table->index('assigned_to');
            $table->index('model_id');
            $table->index('division_id');
            $table->index('location_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
