<?php

namespace App\Exceptions;

use Exception;

/**
 * Invalid Token Exception
 * 
 * Thrown when JWT token is invalid or expired
 */
class InvalidTokenException extends Exception
{
    public function __construct(string $message = "Invalid or expired token")
    {
        parent::__construct($message, 401);
    }
}
