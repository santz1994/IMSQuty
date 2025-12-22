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
        Schema::create('tickets_canned_fields', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('location_id');
            $table->unsignedBigInteger('ticket_status_id');
            $table->unsignedBigInteger('ticket_type_id');
            $table->unsignedBigInteger('ticket_priority_id');
            $table->string('subject');
            $table->text('description');
            $table->timestamps();

            $table->foreign('ticket_status_id')->references('id')->on('tickets_statuses')->onDelete('restrict');
            $table->foreign('ticket_type_id')->references('id')->on('tickets_types')->onDelete('restrict');
            $table->foreign('ticket_priority_id')->references('id')->on('tickets_priorities')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets_canned_fields');
    }
};
