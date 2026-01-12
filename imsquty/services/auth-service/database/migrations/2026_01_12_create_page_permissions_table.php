<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Create Page Permissions Table
 * 
 * This allows superadmin to control which pages/routes each role can access.
 * More granular than feature permissions - controls UI page visibility.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Pages/Routes definition table
        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->string('path', 100)->unique()->comment('Route path e.g. /assets, /tickets');
            $table->string('name', 100)->comment('Display name');
            $table->string('module', 50)->comment('Module group: Assets, Tickets, etc');
            $table->string('icon', 50)->nullable()->comment('MUI icon name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            
            $table->index('module');
            $table->index('is_active');
        });

        // Role-Page permissions junction table
        Schema::create('role_page_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')->constrained('roles')->onDelete('cascade');
            $table->foreignId('page_id')->constrained('pages')->onDelete('cascade');
            $table->boolean('can_access')->default(true);
            $table->timestamps();
            
            $table->unique(['role_id', 'page_id']);
            $table->index('role_id');
            $table->index('page_id');
        });

        // Seed default pages
        DB::table('pages')->insert([
            // Dashboard
            ['path' => '/dashboard', 'name' => 'Dashboard', 'module' => 'Core', 'icon' => 'Dashboard', 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            
            // Assets Module
            ['path' => '/assets', 'name' => 'Asset List', 'module' => 'Assets', 'icon' => 'Inventory', 'sort_order' => 10, 'created_at' => now(), 'updated_at' => now()],
            ['path' => '/assets/create', 'name' => 'Create Asset', 'module' => 'Assets', 'icon' => 'Add', 'sort_order' => 11, 'created_at' => now(), 'updated_at' => now()],
            ['path' => '/assets/:id', 'name' => 'Asset Detail', 'module' => 'Assets', 'icon' => 'Info', 'sort_order' => 12, 'created_at' => now(), 'updated_at' => now()],
            
            // Tickets Module
            ['path' => '/tickets', 'name' => 'Ticket List', 'module' => 'Tickets', 'icon' => 'ConfirmationNumber', 'sort_order' => 20, 'created_at' => now(), 'updated_at' => now()],
            ['path' => '/tickets/create', 'name' => 'Create Ticket', 'module' => 'Tickets', 'icon' => 'Add', 'sort_order' => 21, 'created_at' => now(), 'updated_at' => now()],
            ['path' => '/tickets/:id', 'name' => 'Ticket Detail', 'module' => 'Tickets', 'icon' => 'Info', 'sort_order' => 22, 'created_at' => now(), 'updated_at' => now()],
            
            // Inventory Module
            ['path' => '/inventory', 'name' => 'Inventory List', 'module' => 'Inventory', 'icon' => 'Warehouse', 'sort_order' => 30, 'created_at' => now(), 'updated_at' => now()],
            
            // Financial Module
            ['path' => '/financial', 'name' => 'Financial Records', 'module' => 'Financial', 'icon' => 'AttachMoney', 'sort_order' => 40, 'created_at' => now(), 'updated_at' => now()],
            
            // Meeting Rooms Module
            ['path' => '/meeting-rooms', 'name' => 'Meeting Rooms', 'module' => 'Meeting Rooms', 'icon' => 'MeetingRoom', 'sort_order' => 50, 'created_at' => now(), 'updated_at' => now()],
            ['path' => '/meeting-rooms/calendar', 'name' => 'Booking Calendar', 'module' => 'Meeting Rooms', 'icon' => 'CalendarMonth', 'sort_order' => 51, 'created_at' => now(), 'updated_at' => now()],
            ['path' => '/meeting-rooms/approvals', 'name' => 'Booking Approvals', 'module' => 'Meeting Rooms', 'icon' => 'CheckCircle', 'sort_order' => 52, 'created_at' => now(), 'updated_at' => now()],
            ['path' => '/meeting-rooms/receptionist', 'name' => 'Receptionist Panel', 'module' => 'Meeting Rooms', 'icon' => 'AdminPanelSettings', 'sort_order' => 53, 'created_at' => now(), 'updated_at' => now()],
            
            // Reports Module
            ['path' => '/reports', 'name' => 'Reports', 'module' => 'Reports', 'icon' => 'Assessment', 'sort_order' => 60, 'created_at' => now(), 'updated_at' => now()],
            
            // Notifications
            ['path' => '/notifications', 'name' => 'Notifications', 'module' => 'Core', 'icon' => 'Notifications', 'sort_order' => 70, 'created_at' => now(), 'updated_at' => now()],
            
            // Settings
            ['path' => '/settings', 'name' => 'Settings', 'module' => 'Core', 'icon' => 'Settings', 'sort_order' => 80, 'created_at' => now(), 'updated_at' => now()],
            
            // Admin Panel Pages
            ['path' => '/admin/users', 'name' => 'User Management', 'module' => 'Admin', 'icon' => 'People', 'sort_order' => 90, 'created_at' => now(), 'updated_at' => now()],
            ['path' => '/admin/roles', 'name' => 'Roles & Permissions', 'module' => 'Admin', 'icon' => 'Security', 'sort_order' => 91, 'created_at' => now(), 'updated_at' => now()],
            ['path' => '/admin/audit-logs', 'name' => 'Audit Logs', 'module' => 'Admin', 'icon' => 'History', 'sort_order' => 92, 'created_at' => now(), 'updated_at' => now()],
            ['path' => '/admin/system-settings', 'name' => 'System Settings', 'module' => 'Admin', 'icon' => 'Settings', 'sort_order' => 93, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role_page_permissions');
        Schema::dropIfExists('pages');
    }
};
