<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * Auth Controller Feature Tests
 * 
 * Tests authentication endpoints:
 * - Login
 * - Logout
 * - Token refresh
 * - Get current user
 */
class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected string $password = '123456';

    protected function setUp(): void
    {
        parent::setUp();

        // Create test user
        $this->user = User::create([
            'username' => 'testuser',
            'email' => 'test@quty.co.id',
            'password' => Hash::make($this->password),
            'first_name' => 'Test',
            'last_name' => 'User',
            'status' => 'active'
        ]);
    }

    /**
     * Test successful login with valid credentials
     */
    public function test_login_withValidCredentials_returnsTokenAndUser(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $this->user->email,
            'password' => $this->password
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data' => [
                         'access_token',
                         'refresh_token',
                         'token_type',
                         'expires_in',
                         'user' => [
                             'id',
                             'email',
                             'username',
                             'first_name',
                             'last_name'
                         ]
                     ],
                     'message'
                 ])
                 ->assertJson([
                     'success' => true,
                     'message' => 'Login successful'
                 ]);

        $this->assertDatabaseHas('login_history', [
            'email' => $this->user->email,
            'success' => true
        ]);
    }

    /**
     * Test login with invalid email
     */
    public function test_login_withInvalidEmail_returns401(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'wrong@quty.co.id',
            'password' => $this->password
        ]);

        $response->assertStatus(401)
                 ->assertJson([
                     'success' => false,
                     'error' => [
                         'code' => 'INVALID_CREDENTIALS'
                     ]
                 ]);

        $this->assertDatabaseHas('login_history', [
            'email' => 'wrong@quty.co.id',
            'success' => false
        ]);
    }

    /**
     * Test login with invalid password
     */
    public function test_login_withInvalidPassword_returns401(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $this->user->email,
            'password' => 'wrongpassword'
        ]);

        $response->assertStatus(401)
                 ->assertJson([
                     'success' => false,
                     'error' => [
                         'code' => 'INVALID_CREDENTIALS'
                     ]
                 ]);
    }

    /**
     * Test login with missing email
     */
    public function test_login_withMissingEmail_returns422(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'password' => $this->password
        ]);

        $response->assertStatus(422)
                 ->assertJson([
                     'success' => false,
                     'error' => [
                         'code' => 'VALIDATION_ERROR'
                     ]
                 ]);
    }

    /**
     * Test login with missing password
     */
    public function test_login_withMissingPassword_returns422(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $this->user->email
        ]);

        $response->assertStatus(422)
                 ->assertJson([
                     'success' => false,
                     'error' => [
                         'code' => 'VALIDATION_ERROR'
                     ]
                 ]);
    }

    /**
     * Test login with invalid email format
     */
    public function test_login_withInvalidEmailFormat_returns422(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'not-an-email',
            'password' => $this->password
        ]);

        $response->assertStatus(422)
                 ->assertJson([
                     'success' => false,
                     'error' => [
                         'code' => 'VALIDATION_ERROR'
                     ]
                 ]);
    }

    /**
     * Test login with inactive user account
     */
    public function test_login_withInactiveAccount_returns401(): void
    {
        $this->user->update(['status' => 'inactive']);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $this->user->email,
            'password' => $this->password
        ]);

        $response->assertStatus(401)
                 ->assertJson([
                     'success' => false,
                     'error' => [
                         'code' => 'INVALID_CREDENTIALS'
                     ]
                 ]);
    }

    /**
     * Test successful logout
     */
    public function test_logout_withValidToken_returnsSuccess(): void
    {
        // First login to get token
        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => $this->user->email,
            'password' => $this->password
        ]);

        $token = $loginResponse->json('data.access_token');

        // Then logout
        $response = $this->postJson('/api/v1/auth/logout', [], [
            'Authorization' => 'Bearer ' . $token
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'message' => 'Successfully logged out'
                 ]);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $this->user->id,
            'action' => 'LOGOUT',
            'resource' => 'auth'
        ]);
    }

    /**
     * Test logout without token
     */
    public function test_logout_withoutToken_returns401(): void
    {
        $response = $this->postJson('/api/v1/auth/logout');

        $response->assertStatus(401);
    }

    /**
     * Test get current user with valid token
     */
    public function test_me_withValidToken_returnsUserData(): void
    {
        // Login first
        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => $this->user->email,
            'password' => $this->password
        ]);

        $token = $loginResponse->json('data.access_token');

        // Get user info
        $response = $this->getJson('/api/v1/auth/me', [
            'Authorization' => 'Bearer ' . $token
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'data' => [
                         'id' => $this->user->id,
                         'email' => $this->user->email,
                         'username' => $this->user->username
                     ]
                 ]);
    }

    /**
     * Test get current user without token
     */
    public function test_me_withoutToken_returns401(): void
    {
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(401);
    }

    /**
     * Test rate limiting on login attempts
     */
    public function test_login_exceedingRateLimit_returns429(): void
    {
        // Make 6 login attempts (rate limit is 5 per minute)
        for ($i = 0; $i < 6; $i++) {
            $response = $this->postJson('/api/v1/auth/login', [
                'email' => $this->user->email,
                'password' => 'wrongpassword'
            ]);
        }

        // 6th attempt should be rate limited
        $response->assertStatus(429);
    }

    /**
     * Test account lockout after multiple failed attempts
     */
    public function test_login_afterMultipleFailedAttempts_locksAccount(): void
    {
        // Disable middleware for this test to avoid rate limiting interfering with lockout logic
        $this->withoutMiddleware();

        // Make 10 failed login attempts (lockout threshold)
        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/v1/auth/login', [
                'email' => $this->user->email,
                'password' => 'wrongpassword'
            ]);
        }

        // 11th attempt should return account locked
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $this->user->email,
            'password' => $this->password // Even with correct password
        ]);

        $response->assertStatus(423) // 423 Locked
                 ->assertJson([
                     'success' => false,
                     'error' => [
                         'code' => 'ACCOUNT_LOCKED'
                     ]
                 ]);
    }

    /**
     * Test refresh token endpoint
     */
    public function test_refresh_withValidRefreshToken_returnsNewAccessToken(): void
    {
        // Login to get refresh token
        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => $this->user->email,
            'password' => $this->password
        ]);

        $refreshToken = $loginResponse->json('data.refresh_token');

        // Refresh access token
        $response = $this->postJson('/api/v1/auth/refresh', [
            'refresh_token' => $refreshToken
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data' => [
                         'access_token',
                         'token_type',
                         'expires_in'
                     ],
                     'message'
                 ])
                 ->assertJson([
                     'success' => true,
                     'message' => 'Token refreshed successfully'
                 ]);
    }

    /**
     * Test refresh with invalid token
     */
    public function test_refresh_withInvalidToken_returns401(): void
    {
        $response = $this->postJson('/api/v1/auth/refresh', [
            'refresh_token' => 'invalid-token'
        ]);

        $response->assertStatus(401)
                 ->assertJson([
                     'success' => false,
                     'error' => [
                         'code' => 'INVALID_TOKEN'
                     ]
                 ]);
    }
}
