<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class UnauthorizedException extends Exception
{
    protected $statusCode = 401;

    public function __construct(string $message = 'Unauthorized', int $code = 401)
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
