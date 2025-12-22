<?php

namespace App\Services;

use App\Models\User;
use App\Exceptions\InvalidTokenException;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Illuminate\Support\Facades\Cache;

/**
 * JWT Service
 * 
 * Handles JWT token operations:
 * - Generate access/refresh tokens
 * - Validate tokens
 * - Blacklist tokens
 * 
 * @package App\Services
 */
class JwtService
{
    /**
     * Generate access token for user
     * 
     * @param User $user
     * @return string
     */
    public function generateAccessToken(User $user): string
    {
        $customClaims = [
            'type' => 'access',
            'user_id' => $user->id,
            'email' => $user->email
        ];

        return JWTAuth::customClaims($customClaims)->fromUser($user);
    }

    /**
     * Generate refresh token for user
     * 
     * @param User $user
     * @return string
     */
    public function generateRefreshToken(User $user): string
    {
        $customClaims = [
            'type' => 'refresh',
            'user_id' => $user->id,
            'email' => $user->email
        ];

        $ttl = config('jwt.refresh_ttl', 20160); // 14 days in minutes
        
        // Temporarily set TTL for refresh token
        config(['jwt.ttl' => $ttl]);
        $token = JWTAuth::customClaims($customClaims)->fromUser($user);
        
        // Reset TTL to default
        config(['jwt.ttl' => env('JWT_TTL', 60)]);
        
        return $token;
    }

    /**
     * Validate refresh token and return user
     * 
     * @param string $refreshToken
     * @return User|null
     * @throws InvalidTokenException
     */
    public function validateRefreshToken(string $refreshToken): ?User
    {
        try {
            JWTAuth::setToken($refreshToken);
            $payload = JWTAuth::getPayload();

            // Check if it's a refresh token
            if ($payload->get('type') !== 'refresh') {
                throw new InvalidTokenException('Invalid token type');
            }

            // Check if token is blacklisted
            if ($this->isTokenBlacklisted($refreshToken)) {
                throw new InvalidTokenException('Token has been revoked');
            }

            // Get user from token
            $user = JWTAuth::authenticate($refreshToken);

            if (!$user) {
                throw new InvalidTokenException('User not found');
            }

            return $user;

        } catch (TokenExpiredException $e) {
            throw new InvalidTokenException('Token has expired');
        } catch (TokenInvalidException $e) {
            throw new InvalidTokenException('Token is invalid');
        } catch (JWTException $e) {
            throw new InvalidTokenException('Could not validate token');
        }
    }

    /**
     * Blacklist current token
     * 
     * @return void
     */
    public function blacklistToken(): void
    {
        try {
            JWTAuth::parseToken()->invalidate();
            
            // Also add to Redis blacklist for faster checks
            $token = JWTAuth::getToken()->get();
            $ttl = config('jwt.ttl', 60);
            Cache::put("blacklist:{$token}", true, now()->addMinutes($ttl));
            
        } catch (JWTException $e) {
            // Token already invalid, no need to blacklist
        }
    }

    /**
     * Check if token is blacklisted
     * 
     * @param string $token
     * @return bool
     */
    private function isTokenBlacklisted(string $token): bool
    {
        return Cache::has("blacklist:{$token}");
    }

    /**
     * Revoke all tokens for a user
     * 
     * @param User $user
     * @return void
     */
    public function revokeAllUserTokens(User $user): void
    {
        // Add user to global blacklist
        $cacheKey = "user_blacklist:{$user->id}";
        Cache::put($cacheKey, time(), now()->addDays(14));
    }
}
