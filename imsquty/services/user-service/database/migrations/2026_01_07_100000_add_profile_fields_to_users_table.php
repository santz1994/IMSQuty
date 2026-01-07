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
            $table->text('bio')->nullable()->after('phone');
            $table->string('timezone', 50)->nullable()->after('bio');
            $table->string('language', 5)->default('en')->after('timezone');
            $table->string('avatar_path')->nullable()->after('language');
            $table->string('avatar_url')->nullable()->after('avatar_path');
            $table->json('preferences')->nullable()->after('avatar_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'bio',
                'timezone',
                'language',
                'avatar_path',
                'avatar_url',
                'preferences'
            ]);
        });
    }
};
