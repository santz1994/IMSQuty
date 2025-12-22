<?php

namespace Tests\Unit;

use App\Models\User;
use App\Services\AuthService;
use App\Services\JwtService;
use App\Repositories\AuthRepository;
use App\Exceptions\InvalidCredentialsException;
use App\Exceptions\AccountLockedException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;
use Mockery;

/**
 * Auth Service Unit Tests
 * 
 * Tests business logic in AuthService class
 */
class AuthServiceTest extends TestCase
{
    use RefreshDatabase;

    protected AuthService $authService;
    protected AuthRepository $repository;
    protected JwtService $jwtService;
    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::create([
            'username' => 'testuser',
            'email' => 'test@quty.co.id',
            'password' => Hash::make('123456'),
            'first_name' => 'Test',
            'last_name' => 'User',
            'status' => 'active'
        ]);

        $this->repository = new AuthRepository();
        $this->jwtService = new JwtService();
        $this->authService = new AuthService($this->repository, $this->jwtService);
    }

    /**
     * Test successful login
     */
    public function test_login_withValidCredentials_returnsTokensAndUser(): void
    {
        $result = $this->authService->login([
            'email' => 'test@quty.co.id',
            'password' => '123456'
        ]);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('access_token', $result);
        $this->assertArrayHasKey('refresh_token', $result);
        $this->assertArrayHasKey('user', $result);
        $this->assertEquals($this->user->id, $result['user']->id);
    }

    /**
     * Test login with invalid email
     */
    public function test_login_withInvalidEmail_throwsException(): void
    {
        $this->expectException(InvalidCredentialsException::class);

        $this->authService->login([
            'email' => 'wrong@quty.co.id',
            'password' => '123456'
        ]);
    }

    /**
     * Test login with invalid password
     */
    public function test_login_withInvalidPassword_throwsException(): void
    {
        $this->expectException(InvalidCredentialsException::class);

        $this->authService->login([
            'email' => 'test@quty.co.id',
            'password' => 'wrongpassword'
        ]);
    }

    /**
     * Test login with inactive user
     */
    public function test_login_withInactiveUser_throwsException(): void
    {
        $this->user->update(['status' => 'inactive']);

        $this->expectException(InvalidCredentialsException::class);
        $this->expectExceptionMessage('Account is not active');

        $this->authService->login([
            'email' => 'test@quty.co.id',
            'password' => '123456'
        ]);
    }

    /**
     * Test failed login increments attempt counter
     */
    public function test_login_withInvalidCredentials_incrementsFailedAttempts(): void
    {
        try {
            $this->authService->login([
                'email' => 'test@quty.co.id',
                'password' => 'wrongpassword'
            ]);
        } catch (InvalidCredentialsException $e) {
            // Expected
        }

        $attempts = Cache::get('attempts:test@quty.co.id', 0);
        $this->assertEquals(1, $attempts);
    }

    /**
     * Test account lockout after 10 failed attempts
     */
    public function test_login_after10FailedAttempts_locksAccount(): void
    {
        // Simulate 10 failed attempts
        Cache::put('attempts:test@quty.co.id', 10, now()->addMinutes(15));
        Cache::put('lockout:test@quty.co.id', true, 900); // 15 minutes

        $this->expectException(AccountLockedException::class);

        $this->authService->login([
            'email' => 'test@quty.co.id',
            'password' => '123456'
        ]);
    }

    /**
     * Test successful login resets failed attempts
     */
    public function test_login_withSuccess_resetsFailedAttempts(): void
    {
        // Set some failed attempts
        Cache::put('attempts:test@quty.co.id', 3, now()->addMinutes(15));

        $this->authService->login([
            'email' => 'test@quty.co.id',
            'password' => '123456'
        ]);

        $attempts = Cache::get('attempts:test@quty.co.id', 0);
        $this->assertEquals(0, $attempts);
    }

    /**
     * Test logout creates audit log
     */
    public function test_logout_createsAuditLog(): void
    {
        $this->authService->logout($this->user);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $this->user->id,
            'action' => 'LOGOUT',
            'resource' => 'auth'
        ]);
    }

    /**
     * Test refresh token with valid token
     */
    public function test_refreshToken_withValidToken_returnsNewAccessToken(): void
    {
        $refreshToken = $this->jwtService->generateRefreshToken($this->user);

        $result = $this->authService->refreshToken($refreshToken);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('access_token', $result);
        $this->assertArrayHasKey('token_type', $result);
        $this->assertArrayHasKey('expires_in', $result);
    }

    /**
     * Test login creates login history record
     */
    public function test_login_createsLoginHistoryRecord(): void
    {
        $this->authService->login([
            'email' => 'test@quty.co.id',
            'password' => '123456'
        ]);

        $this->assertDatabaseHas('login_history', [
            'user_id' => $this->user->id,
            'email' => 'test@quty.co.id',
            'success' => true
        ]);
    }

    /**
     * Test login updates last_login timestamp
     */
    public function test_login_updatesLastLoginTimestamp(): void
    {
        $this->assertNull($this->user->last_login_at);

        $this->authService->login([
            'email' => 'test@quty.co.id',
            'password' => '123456'
        ]);

        $this->user->refresh();
        $this->assertNotNull($this->user->last_login_at);
    }

    protected function tearDown(): void
    {
        Cache::flush();
        Mockery::close();
        parent::tearDown();
    }
}
