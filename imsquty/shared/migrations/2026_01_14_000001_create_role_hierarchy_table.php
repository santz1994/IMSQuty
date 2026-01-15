<?php

/**
 * Migration: Create role_hierarchy table for permission inheritance
 * 
 * Purpose: Enable parent-child role relationships with inheritance strength
 * This allows roles to automatically inherit permissions from parent roles
 * 
 * @author Daniel Rizaldy
 * @date 2026-01-14
 * @session 51
 * @requirement B.5 Enhanced Permissions - Permission Inheritance System
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('role_hierarchy', function (Blueprint $table) {
            $table->id();
            
            // Parent-child relationship
            $table->unsignedBigInteger('parent_role_id')
                  ->comment('Parent role that provides permissions');
            $table->unsignedBigInteger('child_role_id')
                  ->comment('Child role that inherits permissions');
            
            // Inheritance configuration
            $table->tinyInteger('inheritance_strength')
                  ->default(100)
                  ->comment('Percentage of parent permissions inherited (0-100)');
            
            // Metadata
            $table->text('notes')->nullable()
                  ->comment('Optional notes about this inheritance relationship');
            $table->boolean('is_active')->default(true)
                  ->comment('Whether this inheritance is currently active');
            
            // Timestamps
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('parent_role_id')
                  ->references('id')
                  ->on('roles')
                  ->onDelete('cascade')
                  ->onUpdate('cascade');
            
            $table->foreign('child_role_id')
                  ->references('id')
                  ->on('roles')
                  ->onDelete('cascade')
                  ->onUpdate('cascade');
            
            // Constraints
            $table->unique(['parent_role_id', 'child_role_id'], 'unique_hierarchy');
            
            // Indexes for performance
            $table->index('parent_role_id');
            $table->index('child_role_id');
            $table->index('is_active');
        });
        
        // Insert default hierarchy relationships
        DB::table('role_hierarchy')->insert([
            [
                'parent_role_id' => 1, // Superadmin (Level 1)
                'child_role_id' => 2,  // Admin (Level 2)
                'inheritance_strength' => 80,
                'notes' => 'Admin inherits 80% of Superadmin permissions',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_role_id' => 2, // Admin (Level 2)
                'child_role_id' => 3,  // Manager (Level 3)
                'inheritance_strength' => 60,
                'notes' => 'Manager inherits 60% of Admin permissions',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_role_id' => 2, // Admin (Level 2)
                'child_role_id' => 4,  // Director (Level 4)
                'inheritance_strength' => 50,
                'notes' => 'Director inherits 50% of Admin permissions',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('role_hierarchy');
    }
};
