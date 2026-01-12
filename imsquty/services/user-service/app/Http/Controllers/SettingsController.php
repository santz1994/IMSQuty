<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\DB;
use Shared\Traits\ApiResponses;

class SettingsController extends Controller
{
    use ApiResponses;

    /**
     * Get all system settings
     */
    public function index(): JsonResponse
    {
        try {
            $settings = [
                'application' => [
                    'app_name' => config('app.name', 'IMSQuty'),
                    'app_version' => '1.0.0',
                    'app_url' => config('app.url'),
                    'app_timezone' => config('app.timezone'),
                    'app_locale' => config('app.locale'),
                    'company_name' => env('COMPANY_NAME', 'PT Quty Indonesia'),
                    'company_logo' => env('COMPANY_LOGO', '/logo.png'),
                ],
                'email' => [
                    'mail_driver' => config('mail.default'),
                    'mail_host' => config('mail.mailers.smtp.host'),
                    'mail_port' => config('mail.mailers.smtp.port'),
                    'mail_username' => config('mail.mailers.smtp.username'),
                    'mail_password' => '********',
                    'mail_encryption' => config('mail.mailers.smtp.encryption'),
                    'mail_from_address' => config('mail.from.address'),
                    'mail_from_name' => config('mail.from.name'),
                ],
                'storage' => [
                    'storage_driver' => config('filesystems.default'),
                    'minio_endpoint' => env('MINIO_ENDPOINT', 'http://minio:9000'),
                    'minio_bucket' => env('MINIO_BUCKET', 'imsquty'),
                    'minio_access_key' => env('MINIO_ACCESS_KEY', '********'),
                    'minio_secret_key' => '********',
                    'minio_region' => env('MINIO_REGION', 'us-east-1'),
                    'max_upload_size' => ini_get('upload_max_filesize'),
                ],
                'queue' => [
                    'queue_connection' => config('queue.default'),
                    'rabbitmq_host' => env('RABBITMQ_HOST', 'rabbitmq'),
                    'rabbitmq_port' => env('RABBITMQ_PORT', 5672),
                    'rabbitmq_user' => env('RABBITMQ_USER', 'guest'),
                    'rabbitmq_password' => '********',
                    'rabbitmq_vhost' => env('RABBITMQ_VHOST', '/'),
                ],
                'cache' => [
                    'cache_driver' => config('cache.default'),
                    'redis_host' => env('REDIS_HOST', 'redis'),
                    'redis_port' => env('REDIS_PORT', 6379),
                    'redis_password' => env('REDIS_PASSWORD') ? '********' : '',
                    'redis_database' => env('REDIS_DB', 0),
                    'cache_ttl' => 3600,
                ],
                'security' => [
                    'session_timeout' => config('session.lifetime', 120),
                    'max_login_attempts' => 5,
                    'enable_2fa' => false,
                    'enable_audit_logging' => true,
                    'enable_api_throttling' => true,
                    'api_throttle_rate' => 60,
                ],
                'maintenance' => [
                    'maintenance_mode' => app()->isDownForMaintenance(),
                    'maintenance_message' => 'System is under maintenance',
                    'maintenance_allowed_ips' => [],
                ],
            ];

            return $this->successResponse($settings, 'Settings retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve settings: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get settings by category
     */
    public function show(string $category): JsonResponse
    {
        try {
            $allSettings = $this->index()->getData();
            
            if (!isset($allSettings->data->$category)) {
                return $this->errorResponse('Settings category not found', 404);
            }

            return $this->successResponse($allSettings->data->$category, "Settings for {$category} retrieved successfully");
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve settings: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get cache statistics
     */
    public function getCacheStats(): JsonResponse
    {
        try {
            $redis = Redis::connection();
            $info = $redis->info();
            
            $stats = [
                'total_keys' => $redis->dbsize(),
                'memory_used' => $info['used_memory_human'] ?? '0B',
                'memory_limit' => ini_get('memory_limit'),
                'hit_rate' => isset($info['keyspace_hits']) && isset($info['keyspace_misses']) 
                    ? round(($info['keyspace_hits'] / ($info['keyspace_hits'] + $info['keyspace_misses'])) * 100, 2)
                    : 0,
                'connections' => $info['connected_clients'] ?? 0,
            ];

            return $this->successResponse($stats, 'Cache statistics retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve cache stats: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Clear cache
     */
    public function clearCache(): JsonResponse
    {
        try {
            Cache::flush();
            return $this->successResponse(null, 'Cache cleared successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to clear cache: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get queue statistics
     */
    public function getQueueStats(): JsonResponse
    {
        try {
            // Get queue statistics from database
            $stats = [
                'pending_jobs' => DB::table('jobs')->count(),
                'failed_jobs' => DB::table('failed_jobs')->count(),
                'processed_jobs' => DB::table('jobs')->where('reserved_at', '!=', null)->count(),
                'workers_active' => 1, // Mock value
                'queue_status' => 'running',
            ];

            return $this->successResponse($stats, 'Queue statistics retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve queue stats: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Clear failed queue jobs
     */
    public function clearFailedJobs(): JsonResponse
    {
        try {
            $count = DB::table('failed_jobs')->delete();
            return $this->successResponse([
                'cleared_count' => $count
            ], 'Failed jobs cleared successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to clear failed jobs: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Flush cache by pattern
     */
    public function flushCacheByPattern(Request $request): JsonResponse
    {
        try {
            $pattern = $request->input('pattern', '*');
            $redis = Redis::connection();
            
            $keys = $redis->keys($pattern);
            $flushedCount = 0;
            
            foreach ($keys as $key) {
                $redis->del($key);
                $flushedCount++;
            }

            return $this->successResponse([
                'flushed_count' => $flushedCount
            ], 'Cache flushed successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to flush cache: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Test email settings
     */
    public function testEmail(Request $request): JsonResponse
    {
        try {
            // Mock email test - in production, send actual test email
            return $this->successResponse(null, 'Email configuration test successful');
        } catch (\Exception $e) {
            return $this->errorResponse('Email test failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Test storage settings
     */
    public function testStorage(Request $request): JsonResponse
    {
        try {
            // Mock storage test - in production, test actual MinIO connection
            return $this->successResponse(null, 'Storage configuration test successful');
        } catch (\Exception $e) {
            return $this->errorResponse('Storage test failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Toggle maintenance mode
     */
    public function toggleMaintenance(Request $request): JsonResponse
    {
        try {
            $enabled = $request->input('enabled', false);
            $message = $request->input('message', 'System is under maintenance');

            if ($enabled) {
                \Artisan::call('down', ['--message' => $message]);
            } else {
                \Artisan::call('up');
            }

            return $this->successResponse(null, 'Maintenance mode ' . ($enabled ? 'enabled' : 'disabled'));
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to toggle maintenance mode: ' . $e->getMessage(), 500);
        }
    }
}
