<?php

/**
 * Migration: Enhance permissions table for advanced features
 * 
 * Purpose: Add custom permission support, risk levels, and categorization
 * Enables conflict detection and better permission organization
 * 
 * @author Daniel Rizaldy
 * @date 2026-01-14
 * @session 51
 * @requirement B.5 Enhanced Permissions - Custom Permissions & Conflict Detection
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
        // Add new columns to permissions table
        Schema::table('permissions', function (Blueprint $table) {
            // Custom permission support
            $table->boolean('is_custom')->default(false)
                  ->after('action')
                  ->comment('Whether this is a custom user-created permission');
            
            // Risk level classification
            $table->enum('risk_level', ['low', 'medium', 'high', 'critical'])
                  ->default('medium')
                  ->after('is_custom')
                  ->comment('Risk level of granting this permission');
            
            // Categorization
            $table->string('category', 50)->nullable()
                  ->after('risk_level')
                  ->comment('Permission category (e.g., user, asset, financial)');
            
            $table->string('subcategory', 50)->nullable()
                  ->after('category')
                  ->comment('Permission subcategory for fine-grained organization');
            
            // Conflict detection
            $table->json('conflicts_with')->nullable()
                  ->after('subcategory')
                  ->comment('Array of permission IDs that conflict with this one');
            
            $table->json('requires')->nullable()
                  ->after('conflicts_with')
                  ->comment('Array of permission IDs required before granting this one');
            
            // Metadata
            $table->boolean('is_system')->default(true)
                  ->after('requires')
                  ->comment('System permissions cannot be deleted');
            
            // Indexes
            $table->index('is_custom');
            $table->index('risk_level');
            $table->index('category');
            $table->index('is_system');
        });
        
        // Create permission_conflict_rules table
        Schema::create('permission_conflict_rules', function (Blueprint $table) {
            $table->id();
            
            // Conflict definition
            $table->unsignedBigInteger('permission_a_id')
                  ->comment('First permission in conflict');
            $table->unsignedBigInteger('permission_b_id')
                  ->comment('Second permission in conflict');
            
            // Conflict details
            $table->enum('conflict_type', ['mutual_exclusive', 'requires', 'incompatible'])
                  ->comment('Type of conflict relationship');
            $table->text('reason')
                  ->comment('Human-readable explanation of the conflict');
            $table->enum('severity', ['warning', 'error'])
                  ->default('warning')
                  ->comment('Whether this conflict blocks assignment');
            
            // Metadata
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('permission_a_id')
                  ->references('id')
                  ->on('permissions')
                  ->onDelete('cascade');
            
            $table->foreign('permission_b_id')
                  ->references('id')
                  ->on('permissions')
                  ->onDelete('cascade');
            
            // Constraints
            $table->unique(['permission_a_id', 'permission_b_id'], 'unique_conflict');
            
            // Indexes
            $table->index('conflict_type');
            $table->index('is_active');
        });
        
        // Create bulk_permission_operations table for audit trail
        Schema::create('bulk_permission_operations', function (Blueprint $table) {
            $table->id();
            
            // Operation details
            $table->enum('operation_type', ['assign', 'revoke', 'template'])
                  ->comment('Type of bulk operation performed');
            $table->unsignedBigInteger('performed_by')
                  ->comment('User ID who performed the operation');
            
            // Scope
            $table->json('role_ids')
                  ->comment('Array of role IDs affected');
            $table->json('permission_ids')
                  ->comment('Array of permission IDs affected');
            
            // Results
            $table->integer('total_operations')->default(0);
            $table->integer('successful_operations')->default(0);
            $table->integer('failed_operations')->default(0);
            $table->json('errors')->nullable()
                  ->comment('Array of error messages if any');
            
            // Metadata
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Foreign key
            $table->foreign('performed_by')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');
            
            // Indexes
            $table->index('operation_type');
            $table->index('performed_by');
            $table->index('created_at');
        });
        
        // Create permission_templates table
        Schema::create('permission_templates', function (Blueprint $table) {
            $table->id();
            
            // Template details
            $table->string('name', 100)->unique()
                  ->comment('Template name (e.g., "Department Manager", "Finance Team")');
            $table->text('description')->nullable();
            
            // Template content
            $table->json('permission_ids')
                  ->comment('Array of permission IDs included in this template');
            
            // Configuration
            $table->boolean('is_public')->default(false)
                  ->comment('Whether template is available to all admins');
            $table->unsignedBigInteger('created_by')
                  ->comment('User who created this template');
            
            // Usage tracking
            $table->integer('usage_count')->default(0)
                  ->comment('Number of times this template has been applied');
            
            // Metadata
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Foreign key
            $table->foreign('created_by')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');
            
            // Indexes
            $table->index('is_public');
            $table->index('is_active');
            $table->index('created_by');
        });
        
        // Update existing permissions with categorization
        DB::statement("UPDATE permissions SET category = 'users', risk_level = 'medium' WHERE resource LIKE '%user%'");
        DB::statement("UPDATE permissions SET category = 'assets', risk_level = 'low' WHERE resource LIKE '%asset%'");
        DB::statement("UPDATE permissions SET category = 'financial', risk_level = 'high' WHERE resource LIKE '%financial%'");
        DB::statement("UPDATE permissions SET category = 'tickets', risk_level = 'low' WHERE resource LIKE '%ticket%'");
        DB::statement("UPDATE permissions SET category = 'meetings', risk_level = 'low' WHERE resource LIKE '%meeting%'");
        DB::statement("UPDATE permissions SET category = 'system', risk_level = 'critical' WHERE action IN ('delete', 'manage')");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Drop new tables
        Schema::dropIfExists('permission_templates');
        Schema::dropIfExists('bulk_permission_operations');
        Schema::dropIfExists('permission_conflict_rules');
        
        // Remove new columns from permissions table
        Schema::table('permissions', function (Blueprint $table) {
            $table->dropIndex(['is_custom']);
            $table->dropIndex(['risk_level']);
            $table->dropIndex(['category']);
            $table->dropIndex(['is_system']);
            
            $table->dropColumn([
                'is_custom',
                'risk_level',
                'category',
                'subcategory',
                'conflicts_with',
                'requires',
                'is_system'
            ]);
        });
    }
};
