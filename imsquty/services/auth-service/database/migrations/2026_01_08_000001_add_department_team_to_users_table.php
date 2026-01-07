<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations - Add department and team support to users
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add department and team foreign keys
            $table->foreignId('department_id')->nullable()->after('phone')->constrained('departments')->onDelete('set null');
            $table->foreignId('team_id')->nullable()->after('department_id')->constrained('teams')->onDelete('set null');
            
            // Add additional user fields
            $table->string('position', 100)->nullable()->after('team_id');
            $table->text('bio')->nullable()->after('position');
            $table->string('timezone', 50)->default('Asia/Jakarta')->after('bio');
            $table->string('language', 10)->default('id')->after('timezone');
            
            // Add indexes
            $table->index('department_id');
            $table->index('team_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['department_id']);
            $table->dropForeign(['team_id']);
            $table->dropColumn(['department_id', 'team_id', 'position', 'bio', 'timezone', 'language']);
        });
    }
};
