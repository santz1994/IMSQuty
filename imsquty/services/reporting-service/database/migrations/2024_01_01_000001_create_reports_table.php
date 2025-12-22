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
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->string('name', 200);
            $table->string('type', 100); // Asset, Ticket, Financial, Inventory, User, Custom
            $table->text('description')->nullable();
            $table->json('parameters')->nullable(); // Report parameters
            $table->json('result_data')->nullable(); // Report results
            $table->string('status', 50); // Pending, Processing, Completed, Failed
            $table->timestamp('generated_at')->nullable();
            $table->string('file_path')->nullable();
            $table->string('format', 50); // PDF, Excel, CSV, JSON
            $table->unsignedBigInteger('created_by')->nullable(); // User Service
            $table->unsignedBigInteger('updated_by')->nullable(); // User Service
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('type');
            $table->index('status');
            $table->index('generated_at');
            $table->index('created_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
