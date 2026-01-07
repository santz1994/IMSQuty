<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class NotFoundException extends Exception
{
    protected $statusCode;

    public function __construct(string $message = 'Resource not found', int $code = 404)
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
