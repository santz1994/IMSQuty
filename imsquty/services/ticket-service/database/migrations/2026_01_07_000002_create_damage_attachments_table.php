<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('damage_attachments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->uuid('damage_report_id');
            $table->string('file_name');
            $table->string('file_path');
            $table->string('mime_type');
            $table->bigInteger('file_size');
            $table->enum('type', ['photo', 'document', 'video', 'other'])->default('photo');
            $table->text('description')->nullable();
            
            $table->unsignedBigInteger('uploaded_by_user_id');
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('damage_report_id')->references('id')->on('damage_reports')->onDelete('cascade');
            $table->index('damage_report_id');
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('damage_attachments');
    }
};
