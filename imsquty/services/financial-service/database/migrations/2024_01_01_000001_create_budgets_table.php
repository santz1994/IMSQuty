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
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();
            $table->string('name', 200);
            $table->string('category', 100); // IT, HR, Marketing, Operations, R&D
            $table->decimal('allocated_amount', 15, 2);
            $table->decimal('spent_amount', 15, 2)->default(0);
            $table->date('period_start');
            $table->date('period_end');
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('created_by')->nullable(); // User Service
            $table->unsignedBigInteger('updated_by')->nullable(); // User Service
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('category');
            $table->index('period_start');
            $table->index('period_end');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};
