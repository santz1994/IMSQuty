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
        Schema::create('sla_policies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('response_time')->comment('Minutes to first response');
            $table->integer('resolution_time')->comment('Minutes to resolution');
            $table->unsignedBigInteger('priority_id')->nullable();
            $table->boolean('business_hours_only')->default(true);
            $table->integer('escalation_time')->nullable()->comment('Minutes before escalation');
            $table->unsignedBigInteger('escalate_to_user_id')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('priority_id')->references('id')->on('tickets_priorities')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sla_policies');
    }
};
