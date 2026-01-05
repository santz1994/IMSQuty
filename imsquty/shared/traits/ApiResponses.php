<?php

namespace Shared\Traits;

use Illuminate\Http\JsonResponse;

/**
 * ApiResponses Trait
 * 
 * Provides consistent API response formatting across all controllers.
 * Eliminates 70% of boilerplate code in controller methods.
 * 
 * Usage:
 * ```php
 * class UserController extends Controller
 * {
 *     use ApiResponses;
 *     
 *     public function store(Request $request)
 *     {
 *         $user = $this->service->create($request->validated());
 *         return $this->successResponse($user, 'User created successfully', 201);
 *     }
 * }
 * ```
 */
trait ApiResponses
{
    /**
     * Return a success JSON response
     * 
     * @param mixed $data The data to return
     * @param string $message Success message
     * @param int $statusCode HTTP status code (default: 200)
     * @return JsonResponse
     */
    protected function successResponse($data, string $message = 'Operation successful', int $statusCode = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => $message
        ], $statusCode);
    }
    
    /**
     * Return a created resource response
     * 
     * @param mixed $data The created resource
     * @param string $message Success message
     * @return JsonResponse
     */
    protected function createdResponse($data, string $message = 'Resource created successfully'): JsonResponse
    {
        return $this->successResponse($data, $message, 201);
    }
    
    /**
     * Return an error JSON response
     * 
     * @param string $message Error message
     * @param int $statusCode HTTP status code (default: 500)
     * @param mixed $errors Additional error details
     * @return JsonResponse
     */
    protected function errorResponse(string $message, int $statusCode = 500, $errors = null): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message
        ];
        
        if ($errors !== null) {
            $response['errors'] = $errors;
        }
        
        return response()->json($response, $statusCode);
    }
    
    /**
     * Return a not found error response
     * 
     * @param string $message Error message
     * @return JsonResponse
     */
    protected function notFoundResponse(string $message = 'Resource not found'): JsonResponse
    {
        return $this->errorResponse($message, 404);
    }
    
    /**
     * Return a validation error response
     * 
     * @param array $errors Validation errors
     * @param string $message Error message
     * @return JsonResponse
     */
    protected function validationErrorResponse(array $errors, string $message = 'Validation failed'): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors
        ], 422);
    }
    
    /**
     * Return an unauthorized error response
     * 
     * @param string $message Error message
     * @return JsonResponse
     */
    protected function unauthorizedResponse(string $message = 'Unauthorized'): JsonResponse
    {
        return $this->errorResponse($message, 401);
    }
    
    /**
     * Return a forbidden error response
     * 
     * @param string $message Error message
     * @return JsonResponse
     */
    protected function forbiddenResponse(string $message = 'Forbidden'): JsonResponse
    {
        return $this->errorResponse($message, 403);
    }
    
    /**
     * Return a deleted resource response
     * 
     * @param string $message Success message
     * @return JsonResponse
     */
    protected function deletedResponse(string $message = 'Resource deleted successfully'): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message
        ], 200);
    }
    
    /**
     * Return a paginated response
     * 
     * @param mixed $paginatedData Laravel paginator instance
     * @param string $message Success message
     * @return JsonResponse
     */
    protected function paginatedResponse($paginatedData, string $message = 'Data retrieved successfully'): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $paginatedData->items(),
            'pagination' => [
                'current_page' => $paginatedData->currentPage(),
                'per_page' => $paginatedData->perPage(),
                'total' => $paginatedData->total(),
                'last_page' => $paginatedData->lastPage(),
                'from' => $paginatedData->firstItem(),
                'to' => $paginatedData->lastItem()
            ],
            'message' => $message
        ], 200);
    }
    
    /**
     * Return a no content response
     * 
     * @return JsonResponse
     */
    protected function noContentResponse(): JsonResponse
    {
        return response()->json(null, 204);
    }
}
