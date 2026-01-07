<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class ConflictException extends Exception
{
    protected $statusCode;
    protected $conflictData;

    public function __construct(string $message = 'Resource conflict', array $conflictData = [], int $code = 409)
    {
        $this->statusCode = $code;
        $this->conflictData = $conflictData;
        parent::__construct($message, $code);
    }

    public function render(): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $this->message,
        ];

        if (!empty($this->conflictData)) {
            $response['conflict_data'] = $this->conflictData;
        }

        return response()->json($response, $this->statusCode);
    }

    public function getConflictData(): array
    {
        return $this->conflictData;
    }
}
