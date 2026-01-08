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
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('department_id')->nullable()->after('avatar');
            $table->unsignedBigInteger('team_id')->nullable()->after('department_id');
            $table->string('position', 100)->nullable()->after('team_id');
            $table->text('bio')->nullable()->after('position');
            
            // Add foreign keys
            $table->foreign('department_id')->references('id')->on('departments')->nullOnDelete();
            $table->foreign('team_id')->references('id')->on('teams')->nullOnDelete();
            
            // Add index for better performance
            $table->index(['department_id', 'team_id', 'status']);
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
            $table->dropIndex(['department_id', 'team_id', 'status']);
            $table->dropColumn(['department_id', 'team_id', 'position', 'bio']);
        });
    }
};
