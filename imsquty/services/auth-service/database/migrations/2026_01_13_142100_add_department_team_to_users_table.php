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
            $table->foreignId('department_id')->nullable()->after('phone')->constrained('departments')->nullOnDelete();
            $table->foreignId('team_id')->nullable()->after('department_id')->constrained('teams')->nullOnDelete();
            $table->string('position', 100)->nullable()->after('team_id');
            $table->text('bio')->nullable()->after('position');
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
            $table->dropColumn(['department_id', 'team_id', 'position', 'bio']);
        });
    }
};
