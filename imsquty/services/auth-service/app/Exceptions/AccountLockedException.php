<?php

namespace App\Exceptions;

use Exception;

/**
 * Account Locked Exception
 * 
 * Thrown when account is locked due to too many failed attempts
 */
class AccountLockedException extends Exception
{
    public function __construct(int $minutes = 15)
    {
        parent::__construct("Account is locked. Please try again in {$minutes} minutes.", 423);
    }
}
