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
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_code', 50);
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('assigned_to')->nullable();
            $table->timestamp('assigned_at')->nullable();
            $table->enum('assignment_type', ['auto', 'manual', 'super_admin'])->default('auto');
            $table->timestamp('sla_due')->nullable();
            $table->timestamp('first_response_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->unsignedBigInteger('location_id');
            $table->unsignedBigInteger('asset_id')->nullable();
            $table->unsignedBigInteger('ticket_status_id');
            $table->unsignedBigInteger('ticket_type_id');
            $table->unsignedBigInteger('ticket_priority_id');
            $table->string('subject');
            $table->text('description');
            $table->dateTime('closed')->nullable();
            $table->boolean('is_breached')->default(false);
            $table->timestamps();
            $table->softDeletes();

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
        Schema::dropIfExists('tickets');
    }
};
