<?php

namespace App\Services;

use App\Repositories\AuthRepository;
use App\Exceptions\InvalidCredentialsException;
use App\Exceptions\AccountLockedException;
use App\Exceptions\InvalidTokenException;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Tymon\JWTAuth\Facades\JWTAuth;

/**
 * Auth Service
 * 
 * Contains business logic for authentication:
 * - Login/Logout
 * - Token generation/refresh
 * - Rate limiting
 * - Account lockout
 * - Audit logging
 * 
 * @package App\Services
 */
class AuthService
{
    /**
     * @param AuthRepository $repository
     * @param JwtService $jwtService
     */
    public function __construct(
        private AuthRepository $repository,
        private JwtService $jwtService
    ) {}

    /**
     * Authenticate user with email and password
     * 
     * @param array $credentials ['email' => string, 'password' => string, 'remember_me' => bool]
     * @return array ['access_token' => string, 'refresh_token' => string, 'user' => User]
     * @throws InvalidCredentialsException
     * @throws AccountLockedException
     */
    public function login(array $credentials): array
    {
        $email = $credentials['email'];
        $password = $credentials['password'];
        $rememberMe = $credentials['remember_me'] ?? false;

        // Check if account is locked
        $this->checkAccountLockout($email);

        // Find user by email
        $user = $this->repository->findByEmail($email);

        if (!$user || !Hash::check($password, $user->password)) {
            // Increment failed attempts
            $this->incrementFailedAttempts($email);
            
            // Log failed attempt
            $this->logLoginAttempt($email, false, request()->ip());
            
            throw new InvalidCredentialsException();
        }

        // Check if user is active
        if ($user->status !== 'active') {
            throw new InvalidCredentialsException('Account is not active');
        }

        // Reset failed attempts on successful login
        $this->resetFailedAttempts($email);

        // Generate JWT tokens
        $accessToken = $this->jwtService->generateAccessToken($user);
        $refreshToken = $this->jwtService->generateRefreshToken($user);

        // Update last login
        $this->repository->updateLastLogin($user->id);

        // Log successful login
        $this->logLoginAttempt($email, true, request()->ip(), $user->id);

        // Create audit log
        $this->repository->createAuditLog([
            'user_id' => $user->id,
            'action' => 'LOGIN',
            'resource' => 'auth',
            'resource_id' => $user->id,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);

        return [
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'token_type' => 'bearer',
            'expires_in' => config('jwt.ttl') * 60,
            'user' => $user
        ];
    }

    /**
     * Logout user - invalidate and blacklist token
     * 
     * @param User $user
     * @return void
     */
    public function logout(User $user): void
    {
        // Blacklist the current token
        $this->jwtService->blacklistToken();

        // Create audit log
        $this->repository->createAuditLog([
            'user_id' => $user->id,
            'action' => 'LOGOUT',
            'resource' => 'auth',
            'resource_id' => $user->id,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);

        Log::info('User logged out', [
            'user_id' => $user->id,
            'email' => $user->email
        ]);
    }

    /**
     * Refresh access token using refresh token
     * 
     * @param string $refreshToken
     * @return array ['access_token' => string, 'expires_in' => int]
     * @throws InvalidTokenException
     */
    public function refreshToken(string $refreshToken): array
    {
        try {
            // Validate refresh token and get user
            $user = $this->jwtService->validateRefreshToken($refreshToken);

            if (!$user) {
                throw new InvalidTokenException();
            }

            // Generate new access token
            $newAccessToken = $this->jwtService->generateAccessToken($user);

            // Create audit log
            $this->repository->createAuditLog([
                'user_id' => $user->id,
                'action' => 'TOKEN_REFRESH',
                'resource' => 'auth',
                'resource_id' => $user->id,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent()
            ]);

            return [
                'access_token' => $newAccessToken,
                'token_type' => 'bearer',
                'expires_in' => config('jwt.ttl') * 60
            ];

        } catch (\Exception $e) {
            Log::error('Token refresh failed', [
                'error' => $e->getMessage()
            ]);
            throw new InvalidTokenException();
        }
    }

    /**
     * Check if account is locked out
     * 
     * @param string $email
     * @return void
     * @throws AccountLockedException
     */
    private function checkAccountLockout(string $email): void
    {
        $lockoutKey = "lockout:{$email}";
        
        if (Cache::has($lockoutKey)) {
            $lockoutMinutes = config('auth.lockout_duration', 900) / 60;
            throw new AccountLockedException($lockoutMinutes);
        }
    }

    /**
     * Increment failed login attempts
     * 
     * @param string $email
     * @return void
     */
    private function incrementFailedAttempts(string $email): void
    {
        $attemptKey = "attempts:{$email}";
        $attempts = Cache::get($attemptKey, 0) + 1;
        
        // Store attempts for 15 minutes
        Cache::put($attemptKey, $attempts, now()->addMinutes(15));

        // Lock account if threshold exceeded
        $maxAttempts = config('auth.lockout_attempts', 10);
        if ($attempts >= $maxAttempts) {
            $lockoutKey = "lockout:{$email}";
            $lockoutDuration = config('auth.lockout_duration', 900); // seconds
            Cache::put($lockoutKey, true, $lockoutDuration);
            
            Log::warning('Account locked due to failed attempts', [
                'email' => $email,
                'attempts' => $attempts
            ]);
        }
    }

    /**
     * Reset failed login attempts
     * 
     * @param string $email
     * @return void
     */
    private function resetFailedAttempts(string $email): void
    {
        Cache::forget("attempts:{$email}");
        Cache::forget("lockout:{$email}");
    }

    /**
     * Log login attempt to database
     * 
     * @param string $email
     * @param bool $success
     * @param string $ipAddress
     * @param int|null $userId
     * @return void
     */
    private function logLoginAttempt(
        string $email,
        bool $success,
        string $ipAddress,
        ?int $userId = null
    ): void {
        $this->repository->createLoginHistory([
            'user_id' => $userId,
            'email' => $email,
            'success' => $success,
            'ip_address' => $ipAddress,
            'user_agent' => request()->userAgent()
        ]);
    }
}
