<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserSession;
use PragmaRx\Google2FA\Google2FA;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Collection;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;

/**
 * MFA Service
 * 
 * Handles Multi-Factor Authentication using TOTP (Time-based One-Time Password)
 * Compatible with Google Authenticator, Microsoft Authenticator, Authy, etc.
 */
class MfaService
{
    private Google2FA $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
    }

    /**
     * Generate MFA secret for user
     */
    public function generateSecret(): string
    {
        return $this->google2fa->generateSecretKey();
    }

    /**
     * Generate QR code for authenticator app setup
     */
    public function generateQrCode(User $user, string $secret): string
    {
        $qrCodeUrl = $this->google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secret
        );

        $renderer = new ImageRenderer(
            new RendererStyle(400),
            new SvgImageBackEnd()
        );

        $writer = new Writer($renderer);
        return $writer->writeString($qrCodeUrl);
    }

    /**
     * Verify TOTP code
     */
    public function verifyCode(string $secret, string $code): bool
    {
        return $this->google2fa->verifyKey($secret, $code);
    }

    /**
     * Generate backup codes (8 codes, each 8 characters)
     */
    public function generateBackupCodes(): array
    {
        $codes = [];
        for ($i = 0; $i < 8; $i++) {
            $codes[] = strtoupper(Str::random(4) . '-' . Str::random(4));
        }
        return $codes;
    }

    /**
     * Hash backup codes for storage
     */
    public function hashBackupCodes(array $codes): array
    {
        return array_map(fn($code) => Hash::make($code), $codes);
    }

    /**
     * Verify backup code
     */
    public function verifyBackupCode(User $user, string $code): bool
    {
        if (!$user->mfa_backup_codes) {
            return false;
        }

        $hashedCodes = $user->mfa_backup_codes;
        
        foreach ($hashedCodes as $index => $hashedCode) {
            if (Hash::check($code, $hashedCode)) {
                // Remove used backup code
                $remainingCodes = $hashedCodes;
                unset($remainingCodes[$index]);
                
                $user->update([
                    'mfa_backup_codes' => array_values($remainingCodes),
                    'mfa_backup_codes_used' => $user->mfa_backup_codes_used + 1
                ]);
                
                return true;
            }
        }

        return false;
    }

    /**
     * Enable MFA for user
     */
    public function enableMfa(User $user, string $secret, array $backupCodes): void
    {
        $user->update([
            'mfa_enabled' => true,
            'mfa_secret' => encrypt($secret),
            'mfa_enabled_at' => now(),
            'mfa_backup_codes' => $this->hashBackupCodes($backupCodes),
            'mfa_backup_codes_used' => 0
        ]);
    }

    /**
     * Disable MFA for user
     */
    public function disableMfa(User $user): void
    {
        $user->update([
            'mfa_enabled' => false,
            'mfa_secret' => null,
            'mfa_enabled_at' => null,
            'mfa_backup_codes' => null,
            'mfa_backup_codes_used' => 0
        ]);
    }

    /**
     * Check if user needs MFA verification
     */
    public function requiresMfa(User $user): bool
    {
        return $user->mfa_enabled && !empty($user->mfa_secret);
    }

    /**
     * Get decrypted MFA secret
     */
    public function getSecret(User $user): ?string
    {
        return $user->mfa_secret ? decrypt($user->mfa_secret) : null;
    }
}
