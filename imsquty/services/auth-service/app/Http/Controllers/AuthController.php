<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RefreshTokenRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Auth Controller
 * 
 * Handles authentication endpoints: login, logout, refresh, me
 * Follows thin controller pattern - delegates to AuthService
 * 
 * @package App\Http\Controllers
 */
class AuthController extends Controller
{
    /**
     * @param AuthService $authService
     */
    public function __construct(
        private AuthService $authService
    ) {}

    /**
     * Login with email and password
     * 
     * @param LoginRequest $request
     * @return JsonResponse
     */
    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $result = $this->authService->login(
                $request->validated()
            );

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Login successful'
            ], 200);

        } catch (\App\Exceptions\InvalidCredentialsException $e) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'INVALID_CREDENTIALS',
                    'message' => $e->getMessage()
                ]
            ], 401);

        } catch (\App\Exceptions\AccountLockedException $e) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'ACCOUNT_LOCKED',
                    'message' => $e->getMessage()
                ]
            ], 423);

        } catch (\Exception $e) {
            Log::error('Login error: ' . $e->getMessage(), [
                'email' => $request->email,
                'ip' => $request->ip(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'SERVER_ERROR',
                    'message' => 'An error occurred during login'
                ]
            ], 500);
        }
    }

    /**
     * Logout current user
     * Invalidates and blacklists the JWT token
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $this->authService->logout($request->user());

            return response()->json([
                'success' => true,
                'message' => 'Successfully logged out'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Logout error: ' . $e->getMessage(), [
                'user_id' => $request->user()?->id,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'SERVER_ERROR',
                    'message' => 'An error occurred during logout'
                ]
            ], 500);
        }
    }

    /**
     * Refresh access token using refresh token
     * 
     * @param RefreshTokenRequest $request
     * @return JsonResponse
     */
    public function refresh(RefreshTokenRequest $request): JsonResponse
    {
        try {
            $result = $this->authService->refreshToken(
                $request->input('refresh_token')
            );

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Token refreshed successfully'
            ], 200);

        } catch (\App\Exceptions\InvalidTokenException $e) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'INVALID_TOKEN',
                    'message' => $e->getMessage()
                ]
            ], 401);

        } catch (\Exception $e) {
            Log::error('Token refresh error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'SERVER_ERROR',
                    'message' => 'An error occurred during token refresh'
                ]
            ], 500);
        }
    }

    /**
     * Get authenticated user information
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function me(Request $request): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => new UserResource($request->user())
            ], 200);

        } catch (\Exception $e) {
            Log::error('Get user error: ' . $e->getMessage(), [
                'user_id' => $request->user()?->id,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'SERVER_ERROR',
                    'message' => 'An error occurred retrieving user information'
                ]
            ], 500);
        }
    }
}
