<?php

namespace App\Http\Controllers;

use App\Services\TicketService;
use App\Http\Requests\CreateTicketRequest;
use App\Http\Requests\UpdateTicketRequest;
use App\Http\Requests\AssignTicketRequest;
use App\Http\Requests\AddCommentRequest;
use App\Http\Requests\ChangeStatusRequest;
use App\Http\Resources\TicketResource;
use App\Http\Resources\TicketCollection;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Exception;

class TicketController extends Controller
{
    protected $ticketService;

    public function __construct(TicketService $ticketService)
    {
        $this->ticketService = $ticketService;
    }

    /**
     * Get all tickets with filters
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only([
                'status_id', 
                'priority_id', 
                'type_id', 
                'assigned_to', 
                'created_by', 
                'is_breached', 
                'search',
                'date_from',
                'date_to'
            ]);

            $perPage = $request->input('per_page', 15);
            $tickets = $this->ticketService->getAllTickets($filters, $perPage);

            return response()->json([
                'success' => true,
                'data' => new TicketCollection($tickets),
                'message' => 'Tickets retrieved successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to retrieve tickets'
            ], 500);
        }
    }

    /**
     * Create new ticket
     * 
     * @param CreateTicketRequest $request
     * @return JsonResponse
     */
    public function store(CreateTicketRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $data['user_id'] = auth()->id();

            $ticket = $this->ticketService->createTicket($data);

            return response()->json([
                'success' => true,
                'data' => new TicketResource($ticket),
                'message' => 'Ticket created successfully'
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to create ticket'
            ], 500);
        }
    }

    /**
     * Get single ticket
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $ticket = $this->ticketService->getTicketById($id);

            if (!$ticket) {
                return response()->json([
                    'success' => false,
                    'error' => 'Ticket not found',
                    'message' => 'The requested ticket does not exist'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => new TicketResource($ticket),
                'message' => 'Ticket retrieved successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to retrieve ticket'
            ], 500);
        }
    }

    /**
     * Update ticket
     * 
     * @param UpdateTicketRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateTicketRequest $request, int $id): JsonResponse
    {
        try {
            $ticket = $this->ticketService->getTicketById($id);

            if (!$ticket) {
                return response()->json([
                    'success' => false,
                    'error' => 'Ticket not found',
                    'message' => 'The requested ticket does not exist'
                ], 404);
            }

            $data = $request->validated();
            $ticket = $this->ticketService->updateTicket($ticket, $data);

            return response()->json([
                'success' => true,
                'data' => new TicketResource($ticket),
                'message' => 'Ticket updated successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to update ticket'
            ], 500);
        }
    }

    /**
     * Delete ticket (soft delete)
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $ticket = $this->ticketService->getTicketById($id);

            if (!$ticket) {
                return response()->json([
                    'success' => false,
                    'error' => 'Ticket not found',
                    'message' => 'The requested ticket does not exist'
                ], 404);
            }

            $this->ticketService->deleteTicket($ticket);

            return response()->json([
                'success' => true,
                'message' => 'Ticket deleted successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to delete ticket'
            ], 500);
        }
    }

    /**
     * Restore soft-deleted ticket
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function restore(int $id): JsonResponse
    {
        try {
            $result = $this->ticketService->restoreTicket($id);

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'error' => 'Ticket not found or not deleted',
                    'message' => 'Unable to restore ticket'
                ], 404);
            }

            $ticket = $this->ticketService->getTicketById($id);

            return response()->json([
                'success' => true,
                'data' => new TicketResource($ticket),
                'message' => 'Ticket restored successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to restore ticket'
            ], 500);
        }
    }

    /**
     * Assign ticket to user
     * 
     * @param AssignTicketRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function assign(AssignTicketRequest $request, int $id): JsonResponse
    {
        try {
            $ticket = $this->ticketService->getTicketById($id);

            if (!$ticket) {
                return response()->json([
                    'success' => false,
                    'error' => 'Ticket not found',
                    'message' => 'The requested ticket does not exist'
                ], 404);
            }

            $userId = $request->input('assigned_to');
            $assignmentType = $request->input('assignment_type', 'manual');

            $ticket = $this->ticketService->assignTicket($ticket, $userId, $assignmentType);

            return response()->json([
                'success' => true,
                'data' => new TicketResource($ticket),
                'message' => 'Ticket assigned successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to assign ticket'
            ], 500);
        }
    }

    /**
     * Add comment to ticket
     * 
     * @param AddCommentRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function addComment(AddCommentRequest $request, int $id): JsonResponse
    {
        try {
            $ticket = $this->ticketService->getTicketById($id);

            if (!$ticket) {
                return response()->json([
                    'success' => false,
                    'error' => 'Ticket not found',
                    'message' => 'The requested ticket does not exist'
                ], 404);
            }

            $comment = $request->input('comment');
            $isInternal = $request->input('is_internal', false);

            $ticketComment = $this->ticketService->addComment($ticket, $comment, $isInternal);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $ticketComment->id,
                    'comment' => $ticketComment->comment,
                    'is_internal' => $ticketComment->is_internal,
                    'user' => [
                        'id' => $ticketComment->user->id,
                        'name' => $ticketComment->user->name ?? $ticketComment->user->username,
                    ],
                    'created_at' => $ticketComment->created_at->toIso8601String(),
                ],
                'message' => 'Comment added successfully'
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to add comment'
            ], 500);
        }
    }

    /**
     * Change ticket status
     * 
     * @param ChangeStatusRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function changeStatus(ChangeStatusRequest $request, int $id): JsonResponse
    {
        try {
            $ticket = $this->ticketService->getTicketById($id);

            if (!$ticket) {
                return response()->json([
                    'success' => false,
                    'error' => 'Ticket not found',
                    'message' => 'The requested ticket does not exist'
                ], 404);
            }

            $newStatusId = $request->input('ticket_status_id');
            $ticket = $this->ticketService->changeStatus($ticket, $newStatusId);

            return response()->json([
                'success' => true,
                'data' => new TicketResource($ticket),
                'message' => 'Ticket status changed successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to change ticket status'
            ], 400);
        }
    }

    /**
     * Get ticket statistics
     * 
     * @return JsonResponse
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = $this->ticketService->getStatistics();

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Statistics retrieved successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to retrieve statistics'
            ], 500);
        }
    }
}
