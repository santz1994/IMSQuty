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
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->onDelete('cascade');
            $table->enum('movement_type', ['IN', 'OUT', 'ADJUSTMENT', 'TRANSFER']);
            $table->integer('quantity');
            $table->unsignedBigInteger('from_warehouse_id')->nullable(); // For transfers
            $table->unsignedBigInteger('to_warehouse_id')->nullable(); // For transfers
            $table->unsignedBigInteger('moved_by'); // User Service (no FK)
            $table->timestamp('moved_at');
            $table->text('notes')->nullable();
            $table->string('reference_number', 50)->nullable();
            $table->timestamps();
            
            $table->index('inventory_item_id');
            $table->index('movement_type');
            $table->index('moved_at');
            $table->index('reference_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
