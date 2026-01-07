<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * PasswordPolicy Model
 * 
 * Defines password complexity and security policies
 */
class PasswordPolicy extends Model
{
    protected $fillable = [
        'name',
        'min_length',
        'require_uppercase',
        'require_lowercase',
        'require_numbers',
        'require_special_chars',
        'password_expiry_days',
        'password_history_count',
        'max_login_attempts',
        'lockout_duration_minutes',
        'is_active'
    ];

    protected $casts = [
        'require_uppercase' => 'boolean',
        'require_lowercase' => 'boolean',
        'require_numbers' => 'boolean',
        'require_special_chars' => 'boolean',
        'is_active' => 'boolean'
    ];

    /**
     * Get active password policy
     */
    public static function getActivePolicy()
    {
        return static::where('is_active', true)->first() ?? static::getDefaultPolicy();
    }

    /**
     * Get default policy if none active
     */
    public static function getDefaultPolicy()
    {
        return new static([
            'name' => 'Default',
            'min_length' => 8,
            'require_uppercase' => true,
            'require_lowercase' => true,
            'require_numbers' => true,
            'require_special_chars' => true,
            'password_expiry_days' => 90,
            'password_history_count' => 5,
            'max_login_attempts' => 5,
            'lockout_duration_minutes' => 15
        ]);
    }

    /**
     * Validate password against policy
     */
    public function validatePassword(string $password): array
    {
        $errors = [];

        if (strlen($password) < $this->min_length) {
            $errors[] = "Password must be at least {$this->min_length} characters long";
        }

        if ($this->require_uppercase && !preg_match('/[A-Z]/', $password)) {
            $errors[] = "Password must contain at least one uppercase letter";
        }

        if ($this->require_lowercase && !preg_match('/[a-z]/', $password)) {
            $errors[] = "Password must contain at least one lowercase letter";
        }

        if ($this->require_numbers && !preg_match('/[0-9]/', $password)) {
            $errors[] = "Password must contain at least one number";
        }

        if ($this->require_special_chars && !preg_match('/[^A-Za-z0-9]/', $password)) {
            $errors[] = "Password must contain at least one special character";
        }

        return $errors;
    }
}
