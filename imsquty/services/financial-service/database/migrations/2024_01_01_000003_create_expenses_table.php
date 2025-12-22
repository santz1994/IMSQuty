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
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('budget_id')->constrained('budgets')->onDelete('cascade');
            $table->text('description');
            $table->string('category', 100); // Supplies, Equipment, Travel, Utilities, Services
            $table->decimal('amount', 15, 2);
            $table->date('expense_date');
            $table->string('status', 50); // Pending, Approved, Rejected, Paid
            $table->unsignedBigInteger('approved_by')->nullable(); // User Service
            $table->timestamp('approved_at')->nullable();
            $table->date('paid_date')->nullable();
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('created_by')->nullable(); // User Service
            $table->unsignedBigInteger('updated_by')->nullable(); // User Service
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('budget_id');
            $table->index('category');
            $table->index('expense_date');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
