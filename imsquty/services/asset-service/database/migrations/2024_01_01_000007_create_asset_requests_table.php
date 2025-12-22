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
        Schema::create('asset_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_number', 50)->unique()->nullable();
            $table->unsignedBigInteger('requested_by'); // User Service (no FK constraint)
            $table->unsignedBigInteger('user_id')->nullable(); // User Service (no FK constraint)
            $table->foreignId('asset_type_id')->constrained('asset_types')->onDelete('restrict');
            $table->text('justification');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'fulfilled'])->default('pending');
            $table->unsignedBigInteger('approved_by')->nullable(); // User Service (no FK constraint)
            $table->timestamp('approved_at')->nullable();
            $table->text('approval_notes')->nullable();
            $table->foreignId('fulfilled_asset_id')->nullable()->constrained('assets')->onDelete('set null');
            $table->timestamp('fulfilled_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('request_number');
            $table->index('requested_by');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_requests');
    }
};
