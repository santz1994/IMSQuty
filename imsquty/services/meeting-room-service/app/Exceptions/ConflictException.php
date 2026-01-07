<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class ConflictException extends Exception
{
    protected $statusCode = 409;

    public function __construct(string $message = 'Conflict', int $code = 409)
    {
        $this->statusCode = $code;
        parent::__construct($message, $code);
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $this->message,
        ], $this->statusCode);
    }
}
