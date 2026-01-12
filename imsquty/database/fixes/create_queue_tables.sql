-- ================================================================
-- FIX: Laravel Queue Tables - Jobs & Failed Jobs
-- ================================================================
-- Purpose: Create missing queue tables required by Laravel
-- Error: SQLSTATE[42S02]: Table 'imsquty.jobs' doesn't exist
-- Date: January 12, 2026
-- ================================================================

-- Use the correct database
USE imsquty;

-- ================================================================
-- 1. CREATE JOBS TABLE
-- ================================================================
-- This table stores queued jobs waiting to be processed
-- ================================================================

CREATE TABLE IF NOT EXISTS jobs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  queue VARCHAR(255) NOT NULL,
  payload LONGTEXT NOT NULL,
  attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  reserved_at INT UNSIGNED NULL,
  available_at INT UNSIGNED NOT NULL,
  created_at INT UNSIGNED NOT NULL,
  INDEX jobs_queue_index (queue)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- 2. CREATE FAILED_JOBS TABLE
-- ================================================================
-- This table stores jobs that failed after max retry attempts
-- ================================================================

CREATE TABLE IF NOT EXISTS failed_jobs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid VARCHAR(255) UNIQUE NOT NULL,
  connection TEXT NOT NULL,
  queue TEXT NOT NULL,
  payload LONGTEXT NOT NULL,
  exception LONGTEXT NOT NULL,
  failed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- 3. CREATE JOB_BATCHES TABLE (Optional - for batch jobs)
-- ================================================================
-- This table stores batch job information (Laravel 8+)
-- ================================================================

CREATE TABLE IF NOT EXISTS job_batches (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  total_jobs INT NOT NULL,
  pending_jobs INT NOT NULL,
  failed_jobs INT NOT NULL,
  failed_job_ids LONGTEXT NOT NULL,
  options MEDIUMTEXT NULL,
  cancelled_at INT NULL,
  created_at INT NOT NULL,
  finished_at INT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

SELECT 'Tables created successfully!' as status;

-- Check if tables exist
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'imsquty' 
  AND TABLE_NAME IN ('jobs', 'failed_jobs', 'job_batches');

-- ================================================================
-- USAGE NOTES
-- ================================================================

/*
After creating these tables, update your .env file:

QUEUE_CONNECTION=database
# Or use: redis, rabbitmq, sync

Then test with:
php artisan queue:work
php artisan queue:retry all
php artisan queue:failed

To monitor queue jobs:
SELECT * FROM jobs ORDER BY created_at DESC LIMIT 10;
SELECT * FROM failed_jobs ORDER BY failed_at DESC LIMIT 10;

Common queue commands:
- php artisan queue:work          # Start processing jobs
- php artisan queue:restart       # Restart all queue workers
- php artisan queue:failed        # List failed jobs
- php artisan queue:retry all     # Retry all failed jobs
- php artisan queue:flush         # Delete all failed jobs
- php artisan queue:forget {id}   # Delete specific failed job

For production, use supervisor to keep queue workers running:
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=8
redirect_stderr=true
stdout_logfile=/path/to/worker.log
*/

-- ================================================================
-- END OF SCRIPT
-- ================================================================
