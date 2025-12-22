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
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable()->comment('User who performed the action');
            $table->string('action', 50)->comment('CREATE, UPDATE, DELETE, RESTORE, etc.');
            $table->string('resource', 100)->comment('Model class name or resource type');
            $table->unsignedBigInteger('resource_id')->nullable()->comment('ID of the affected resource');
            $table->json('old_values')->nullable()->comment('Previous state (JSON)');
            $table->json('new_values')->nullable()->comment('New state (JSON)');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();

            // Indexes
            $table->index('user_id');
            $table->index('resource');
            $table->index('resource_id');
            $table->index('action');
            $table->index('created_at');
            $table->index(['resource', 'resource_id']); // Composite index for resource queries
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
