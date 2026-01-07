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
        Schema::create('password_policies', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->integer('min_length')->default(8);
            $table->boolean('require_uppercase')->default(true);
            $table->boolean('require_lowercase')->default(true);
            $table->boolean('require_numbers')->default(true);
            $table->boolean('require_special_chars')->default(true);
            $table->integer('password_expiry_days')->default(90);
            $table->integer('password_history_count')->default(5);
            $table->integer('max_login_attempts')->default(5);
            $table->integer('lockout_duration_minutes')->default(15);
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });
        
        Schema::create('password_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('password');
            $table->timestamp('created_at')->useCurrent();
            
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('password_history');
        Schema::dropIfExists('password_policies');
    }
};
