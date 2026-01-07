<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class ValidationException extends Exception
{
    protected $errors;
    protected $statusCode;

    public function __construct(array $errors = [], string $message = 'Validation failed', int $code = 422)
    {
        $this->errors = $errors;
        $this->statusCode = $code;
        parent::__construct($message, $code);
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $this->message,
            'errors' => $this->errors,
        ], $this->statusCode);
    }

    public function getErrors(): array
    {
        return $this->errors;
    }
}
