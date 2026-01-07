<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations - Create Permissions Table
     *
     * @return void
     */
    public function up()
    {
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique();
            $table->string('slug', 100)->unique();
            $table->text('description')->nullable();
            $table->string('resource', 50)->comment('Module/Resource name: asset, ticket, user, etc');
            $table->string('action', 30)->comment('Action: create, read, update, delete, approve');
            $table->string('scope', 20)->default('all')->comment('Scope: all, department, team, own');
            $table->timestamps();

            $table->index(['resource', 'action']);
            $table->index('slug');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('permissions');
    }
};
