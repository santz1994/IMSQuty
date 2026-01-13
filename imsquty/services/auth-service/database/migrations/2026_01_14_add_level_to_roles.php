<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Adds 'level' field to roles table to support hierarchy:
     * Level 0: Developer (daniel@quty.co.id)
     * Level 1: Superadmin
     * Level 2: Director
     * Level 3: Manager
     * Level 4: HR
     * Level 5: Admin, Receptionist
     * Level 6: User
     */
    public function up(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->tinyInteger('level')->default(6)->after('is_system')->comment('Hierarchy level: 0=highest');
            $table->index('level');
        });

        // Update existing roles with levels (if they exist)
        DB::table('roles')->where('name', 'developer')->update(['level' => 0]);
        DB::table('roles')->where('name', 'superadmin')->update(['level' => 1]);
        DB::table('roles')->where('name', 'director')->update(['level' => 2]);
        DB::table('roles')->where('name', 'manager')->update(['level' => 3]);
        DB::table('roles')->where('name', 'hr')->update(['level' => 4]);
        DB::table('roles')->where('name', 'admin')->update(['level' => 5]);
        DB::table('roles')->where('name', 'receptionist')->update(['level' => 5]);
        DB::table('roles')->where('name', 'user')->update(['level' => 6]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->dropIndex(['level']);
            $table->dropColumn('level');
        });
    }
};
