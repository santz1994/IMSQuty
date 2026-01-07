<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class NotFoundException extends Exception
{
    protected $statusCode = 404;

    public function __construct(string $resource = 'Resource', int $code = 404)
    {
        $message = "{$resource} not found";
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
