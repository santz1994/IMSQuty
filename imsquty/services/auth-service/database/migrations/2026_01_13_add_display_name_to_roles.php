<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->string('display_name', 255)->after('name')->nullable();
        });

        // Update existing roles with display names
        DB::table('roles')->get()->each(function ($role) {
            $displayName = ucwords(str_replace(['_', '-'], ' ', $role->name));
            DB::table('roles')
                ->where('id', $role->id)
                ->update(['display_name' => $displayName]);
        });

        // Make display_name not nullable after populating
        Schema::table('roles', function (Blueprint $table) {
            $table->string('display_name', 255)->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->dropColumn('display_name');
        });
    }
};
