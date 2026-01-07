<?php

namespace App\Http\Controllers;

use App\Http\Requests\EnableMfaRequest;
use App\Http\Requests\VerifyMfaRequest;
use App\Http\Requests\DisableMfaRequest;
use App\Http\Resources\SessionResource;
use App\Http\Resources\LoginHistoryResource;
use App\Services\MfaService;
use App\Services\SessionService;
use App\Models\LoginHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Shared\Traits\ApiResponses;

/**
 * MFA Controller
 * 
 * Handles Multi-Factor Authentication and session management
 */
class MfaController extends Controller
{
    use ApiResponses;

    public function __construct(
        private MfaService $mfaService,
        private SessionService $sessionService
    ) {}

    /**
     * Setup MFA - Generate secret and QR code
     * 
     * @return JsonResponse
     */
    public function setupMfa(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->mfa_enabled) {
            return $this->errorResponse('MFA is already enabled', 400);
        }

        // Generate secret
        $secret = $this->mfaService->generateSecret();

        // Generate QR code (SVG format)
        $qrCode = $this->mfaService->generateQrCode($user, $secret);

        return $this->successResponse([
            'secret' => $secret,
            'qr_code' => $qrCode,
            'message' => 'Scan this QR code with your authenticator app (Google Authenticator, Microsoft Authenticator, Authy, etc.)'
        ], 'MFA setup initiated');
    }

    /**
     * Enable MFA - Verify code and enable
     * 
     * @param EnableMfaRequest $request
     * @return JsonResponse
     */
    public function enableMfa(EnableMfaRequest $request): JsonResponse
    {
        $user = $request->user();

        if ($user->mfa_enabled) {
            return $this->errorResponse('MFA is already enabled', 400);
        }

        // Get secret from session or request
        $secret = session('mfa_setup_secret') ?? $request->input('secret');

        if (!$secret) {
            return $this->errorResponse('MFA setup not initiated. Please call /mfa/setup first', 400);
        }

        // Verify the code
        if (!$this->mfaService->verifyCode($secret, $request->code)) {
            return $this->errorResponse('Invalid verification code', 400);
        }

        // Generate backup codes
        $backupCodes = $this->mfaService->generateBackupCodes();

        // Enable MFA
        $this->mfaService->enableMfa($user, $secret, $backupCodes);

        return $this->successResponse([
            'backup_codes' => $backupCodes,
            'message' => 'Save these backup codes in a safe place. Each code can only be used once.'
        ], 'MFA enabled successfully');
    }

    /**
     * Verify MFA code during login
     * 
     * @param VerifyMfaRequest $request
     * @return JsonResponse
     */
    public function verifyMfa(VerifyMfaRequest $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->mfa_enabled) {
            return $this->errorResponse('MFA is not enabled', 400);
        }

        $secret = $this->mfaService->getSecret($user);

        if (!$secret) {
            return $this->errorResponse('MFA secret not found', 500);
        }

        // Try TOTP code first
        if ($request->code && $this->mfaService->verifyCode($secret, $request->code)) {
            return $this->successResponse(null, 'MFA verification successful');
        }

        // Try backup code if TOTP fails
        if ($request->backup_code && $this->mfaService->verifyBackupCode($user, $request->backup_code)) {
            $remainingCodes = count($user->fresh()->mfa_backup_codes ?? []);
            return $this->successResponse([
                'backup_codes_remaining' => $remainingCodes,
                'warning' => $remainingCodes < 3 ? 'You are running low on backup codes' : null
            ], 'MFA verification successful (backup code used)');
        }

        return $this->errorResponse('Invalid verification code', 400);
    }

    /**
     * Disable MFA
     * 
     * @param DisableMfaRequest $request
     * @return JsonResponse
     */
    public function disableMfa(DisableMfaRequest $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->mfa_enabled) {
            return $this->errorResponse('MFA is not enabled', 400);
        }

        // Verify password
        if (!Hash::check($request->password, $user->password)) {
            return $this->errorResponse('Invalid password', 400);
        }

        // Verify MFA code
        $secret = $this->mfaService->getSecret($user);
        if (!$this->mfaService->verifyCode($secret, $request->code)) {
            return $this->errorResponse('Invalid verification code', 400);
        }

        // Disable MFA
        $this->mfaService->disableMfa($user);

        return $this->successResponse(null, 'MFA disabled successfully');
    }

    /**
     * Regenerate backup codes
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function regenerateBackupCodes(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->mfa_enabled) {
            return $this->errorResponse('MFA is not enabled', 400);
        }

        // Generate new backup codes
        $backupCodes = $this->mfaService->generateBackupCodes();
        $hashedCodes = $this->mfaService->hashBackupCodes($backupCodes);

        $user->update([
            'mfa_backup_codes' => $hashedCodes,
            'mfa_backup_codes_used' => 0
        ]);

        return $this->successResponse([
            'backup_codes' => $backupCodes,
            'message' => 'Save these new backup codes. Your old backup codes are now invalid.'
        ], 'Backup codes regenerated successfully');
    }

    /**
     * Get MFA status
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function getMfaStatus(Request $request): JsonResponse
    {
        $user = $request->user();

        return $this->successResponse([
            'mfa_enabled' => $user->mfa_enabled,
            'mfa_enabled_at' => $user->mfa_enabled_at?->toIso8601String(),
            'backup_codes_count' => count($user->mfa_backup_codes ?? []),
            'backup_codes_used' => $user->mfa_backup_codes_used
        ]);
    }

    // ==================== SESSION MANAGEMENT ====================

    /**
     * Get all active sessions
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function getSessions(Request $request): JsonResponse
    {
        $user = $request->user();
        $sessions = $this->sessionService->getUserActiveSessions($user);

        return $this->successResponse([
            'sessions' => SessionResource::collection($sessions),
            'total' => $sessions->count()
        ]);
    }

    /**
     * Revoke specific session
     * 
     * @param Request $request
     * @param string $sessionId
     * @return JsonResponse
     */
    public function revokeSession(Request $request, string $sessionId): JsonResponse
    {
        $user = $request->user();
        
        // Verify session belongs to user
        $session = \App\Models\UserSession::find($sessionId);
        
        if (!$session || $session->user_id !== $user->id) {
            return $this->errorResponse('Session not found', 404);
        }

        $this->sessionService->revokeSession($sessionId);

        return $this->successResponse(null, 'Session revoked successfully');
    }

    /**
     * Revoke all other sessions (keep current)
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function revokeAllOtherSessions(Request $request): JsonResponse
    {
        $user = $request->user();
        $currentToken = $request->bearerToken();

        $count = $this->sessionService->revokeAllOtherSessions($user, $currentToken);

        return $this->successResponse([
            'revoked_count' => $count
        ], 'All other sessions revoked successfully');
    }

    /**
     * Get session statistics
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function getSessionStatistics(Request $request): JsonResponse
    {
        $user = $request->user();
        $stats = $this->sessionService->getSessionStatistics($user);

        return $this->successResponse($stats);
    }

    // ==================== LOGIN HISTORY ====================

    /**
     * Get login history
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function getLoginHistory(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $history = LoginHistory::where('user_id', $user->id)
            ->orderBy('attempted_at', 'desc')
            ->limit($request->input('limit', 20))
            ->get();

        return $this->successResponse([
            'history' => LoginHistoryResource::collection($history),
            'total' => $history->count()
        ]);
    }
}
