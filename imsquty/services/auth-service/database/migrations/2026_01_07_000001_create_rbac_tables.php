<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations - Create RBAC Tables
     * 
     * Tables:
     * - roles: Role definitions
     * - permissions: Permission definitions  
     * - model_has_roles: Polymorphic many-to-many (User <-> Roles)
     * - model_has_permissions: Polymorphic many-to-many (User <-> Permissions)
     * - role_has_permissions: Many-to-many (Role <-> Permissions)
     */
    public function up(): void
    {
        $tableNames = config('permission.table_names', [
            'roles' => 'roles',
            'permissions' => 'permissions',
            'model_has_permissions' => 'model_has_permissions',
            'model_has_roles' => 'model_has_roles',
            'role_has_permissions' => 'role_has_permissions',
        ]);

        $columnNames = config('permission.column_names', [
            'role_pivot_key' => null,
            'permission_pivot_key' => null,
            'model_morph_key' => 'model_id',
            'team_foreign_key' => 'team_id',
        ]);

        // 1. Permissions Table
        Schema::create($tableNames['permissions'], function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('guard_name', 255);
            $table->string('description', 500)->nullable();
            $table->string('group', 100)->nullable(); // e.g., 'assets', 'tickets', 'users'
            $table->timestamps();

            $table->unique(['name', 'guard_name']);
            $table->index('group');
        });

        // 2. Roles Table
        Schema::create($tableNames['roles'], function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('guard_name', 255);
            $table->string('description', 500)->nullable();
            $table->boolean('is_system')->default(false); // System roles cannot be deleted
            $table->timestamps();

            $table->unique(['name', 'guard_name']);
            $table->index('is_system');
        });

        // 3. Model Has Permissions (Polymorphic)
        Schema::create($tableNames['model_has_permissions'], function (Blueprint $table) use ($tableNames, $columnNames) {
            $table->unsignedBigInteger($columnNames['permission_pivot_key'] ?? 'permission_id');
            $table->string('model_type', 255);
            $table->unsignedBigInteger($columnNames['model_morph_key'] ?? 'model_id');

            $table->primary([
                $columnNames['permission_pivot_key'] ?? 'permission_id',
                $columnNames['model_morph_key'] ?? 'model_id',
                'model_type'
            ], 'model_has_permissions_permission_model_type_primary');

            $table->foreign($columnNames['permission_pivot_key'] ?? 'permission_id')
                ->references('id')
                ->on($tableNames['permissions'])
                ->onDelete('cascade');

            $table->index([
                $columnNames['model_morph_key'] ?? 'model_id',
                'model_type'
            ], 'model_has_permissions_model_id_model_type_index');
        });

        // 4. Model Has Roles (Polymorphic)
        Schema::create($tableNames['model_has_roles'], function (Blueprint $table) use ($tableNames, $columnNames) {
            $table->unsignedBigInteger($columnNames['role_pivot_key'] ?? 'role_id');
            $table->string('model_type', 255);
            $table->unsignedBigInteger($columnNames['model_morph_key'] ?? 'model_id');

            $table->primary([
                $columnNames['role_pivot_key'] ?? 'role_id',
                $columnNames['model_morph_key'] ?? 'model_id',
                'model_type'
            ], 'model_has_roles_role_model_type_primary');

            $table->foreign($columnNames['role_pivot_key'] ?? 'role_id')
                ->references('id')
                ->on($tableNames['roles'])
                ->onDelete('cascade');

            $table->index([
                $columnNames['model_morph_key'] ?? 'model_id',
                'model_type'
            ], 'model_has_roles_model_id_model_type_index');
        });

        // 5. Role Has Permissions
        Schema::create($tableNames['role_has_permissions'], function (Blueprint $table) use ($tableNames, $columnNames) {
            $table->unsignedBigInteger($columnNames['permission_pivot_key'] ?? 'permission_id');
            $table->unsignedBigInteger($columnNames['role_pivot_key'] ?? 'role_id');

            $table->primary([
                $columnNames['permission_pivot_key'] ?? 'permission_id',
                $columnNames['role_pivot_key'] ?? 'role_id'
            ], 'role_has_permissions_permission_id_role_id_primary');

            $table->foreign($columnNames['permission_pivot_key'] ?? 'permission_id')
                ->references('id')
                ->on($tableNames['permissions'])
                ->onDelete('cascade');

            $table->foreign($columnNames['role_pivot_key'] ?? 'role_id')
                ->references('id')
                ->on($tableNames['roles'])
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tableNames = config('permission.table_names', [
            'roles' => 'roles',
            'permissions' => 'permissions',
            'model_has_permissions' => 'model_has_permissions',
            'model_has_roles' => 'model_has_roles',
            'role_has_permissions' => 'role_has_permissions',
        ]);

        Schema::dropIfExists($tableNames['role_has_permissions']);
        Schema::dropIfExists($tableNames['model_has_roles']);
        Schema::dropIfExists($tableNames['model_has_permissions']);
        Schema::dropIfExists($tableNames['roles']);
        Schema::dropIfExists($tableNames['permissions']);
    }
};
