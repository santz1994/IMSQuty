<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('damage_comments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->uuid('damage_report_id');
            $table->text('comment');
            $table->unsignedBigInteger('user_id');
            $table->boolean('is_internal')->default(false);
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('damage_report_id')->references('id')->on('damage_reports')->onDelete('cascade');
            $table->index('damage_report_id');
            $table->index('user_id');
            $table->index('is_internal');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('damage_comments');
    }
};
