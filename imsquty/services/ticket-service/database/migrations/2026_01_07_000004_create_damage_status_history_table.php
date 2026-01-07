<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('damage_status_history', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->uuid('damage_report_id');
            $table->enum('from_status', ['new', 'assigned', 'in-progress', 'on-hold', 'resolved', 'closed']);
            $table->enum('to_status', ['new', 'assigned', 'in-progress', 'on-hold', 'resolved', 'closed']);
            $table->text('reason')->nullable();
            $table->unsignedBigInteger('changed_by_user_id');
            
            $table->timestamps();
            
            $table->foreign('damage_report_id')->references('id')->on('damage_reports')->onDelete('cascade');
            $table->index('damage_report_id');
            $table->index('from_status');
            $table->index('to_status');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('damage_status_history');
    }
};
