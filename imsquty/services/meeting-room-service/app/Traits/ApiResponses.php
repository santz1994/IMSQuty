<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

/**
 * ApiResponses Trait
 * 
 * Provides consistent API response formatting across all controllers.
 */
trait ApiResponses
{
    protected function successResponse($data, string $message = 'Operation successful', int $statusCode = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => $message
        ], $statusCode);
    }
    
    protected function createdResponse($data, string $message = 'Resource created successfully'): JsonResponse
    {
        return $this->successResponse($data, $message, 201);
    }
    
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
    
    protected function notFoundResponse(string $message = 'Resource not found'): JsonResponse
    {
        return $this->errorResponse($message, 404);
    }
    
    protected function validationErrorResponse(array $errors, string $message = 'Validation failed'): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors
        ], 422);
    }
    
    protected function unauthorizedResponse(string $message = 'Unauthorized'): JsonResponse
    {
        return $this->errorResponse($message, 401);
    }
    
    protected function forbiddenResponse(string $message = 'Forbidden'): JsonResponse
    {
        return $this->errorResponse($message, 403);
    }
    
    protected function deletedResponse(string $message = 'Resource deleted successfully'): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message
        ], 200);
    }
    
    protected function paginatedResponse($paginatedData, string $message = 'Data retrieved successfully', string $resourceClass = null): JsonResponse
    {
        $data = $paginatedData->items();
        
        if ($resourceClass) {
            $data = $resourceClass::collection($paginatedData)->resolve();
        }
        
        return response()->json([
            'success' => true,
            'data' => $data,
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
    
    protected function noContentResponse(): JsonResponse
    {
        return response()->json(null, 204);
    }
}
