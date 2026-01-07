<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\SLAController;
use App\Http\Controllers\TicketAssignmentController;
use App\Http\Controllers\EscalationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Health check endpoint
Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'service' => 'ticket-service',
        'status' => 'healthy',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// API v1 routes
Route::prefix('v1')->group(function () {
    
    // Protected routes (require authentication)
    Route::middleware('auth:sanctum')->group(function () {
        
        // Ticket CRUD routes
        Route::get('/tickets', [TicketController::class, 'index']); // List all tickets
        Route::post('/tickets', [TicketController::class, 'store']); // Create new ticket
        Route::get('/tickets/{id}', [TicketController::class, 'show']); // Get single ticket
        Route::put('/tickets/{id}', [TicketController::class, 'update']); // Update ticket
        Route::delete('/tickets/{id}', [TicketController::class, 'destroy']); // Delete ticket
        
        // Ticket operations
        Route::post('/tickets/{id}/restore', [TicketController::class, 'restore']); // Restore deleted ticket
        Route::post('/tickets/{id}/assign', [TicketController::class, 'assign']); // Assign ticket to user
        Route::post('/tickets/{id}/comments', [TicketController::class, 'addComment']); // Add comment
        Route::post('/tickets/{id}/status', [TicketController::class, 'changeStatus']); // Change status
        
        // Ticket statistics
        Route::get('/tickets/stats/summary', [TicketController::class, 'statistics']); // Get statistics
        
        // ============================================
        // SLA Management Routes
        // ============================================
        Route::prefix('sla')->group(function () {
            // Get SLA status for specific ticket
            Route::get('/tickets/{ticketId}/status', [SLAController::class, 'getTicketSLAStatus']);
            
            // Get overdue tickets (SLA breached)
            Route::get('/overdue', [SLAController::class, 'getOverdueTickets']);
            
            // Get tickets at risk of SLA breach
            Route::get('/at-risk', [SLAController::class, 'getAtRiskTickets']);
            
            // Get SLA statistics
            Route::get('/statistics', [SLAController::class, 'getStatistics']);
            
            // Check if ticket should be escalated
            Route::get('/tickets/{ticketId}/check-escalation', [SLAController::class, 'checkEscalation']);
        });
        
        // ============================================
        // Ticket Assignment Routes
        // ============================================
        Route::prefix('assignments')->group(function () {
            // Auto-assign ticket to available technician
            Route::post('/tickets/{ticketId}/auto-assign', [TicketAssignmentController::class, 'autoAssign']);
            
            // Manually assign ticket to specific technician
            Route::post('/tickets/{ticketId}/assign', [TicketAssignmentController::class, 'manualAssign']);
            
            // Reassign ticket to another technician
            Route::post('/tickets/{ticketId}/reassign', [TicketAssignmentController::class, 'reassign']);
            
            // Unassign ticket
            Route::post('/tickets/{ticketId}/unassign', [TicketAssignmentController::class, 'unassign']);
            
            // Get tickets assigned to specific technician
            Route::get('/technicians/{technicianId}/tickets', [TicketAssignmentController::class, 'getByTechnician']);
            
            // Get assignment statistics
            Route::get('/statistics', [TicketAssignmentController::class, 'getStatistics']);
        });
        
        // ============================================
        // Escalation Routes
        // ============================================
        Route::prefix('escalations')->group(function () {
            // Escalate ticket to higher priority
            Route::post('/tickets/{ticketId}/escalate', [EscalationController::class, 'escalate']);
            
            // Auto-escalate all breached tickets
            Route::post('/auto-escalate-breached', [EscalationController::class, 'autoEscalateBreached']);
            
            // De-escalate ticket
            Route::post('/tickets/{ticketId}/de-escalate', [EscalationController::class, 'deEscalate']);
            
            // Get escalation candidates
            Route::get('/candidates', [EscalationController::class, 'getCandidates']);
            
            // Get escalation statistics
            Route::get('/statistics', [EscalationController::class, 'getStatistics']);
        });
    });
});
