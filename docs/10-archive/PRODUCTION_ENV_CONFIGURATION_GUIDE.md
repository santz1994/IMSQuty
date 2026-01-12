# Production Environment Configuration Guide

## Overview
This document provides a comprehensive guide for configuring IMSQuty for production deployment in Indonesia.

## 🔒 Security Checklist

### 1. Application Settings
- [ ] Set `APP_ENV=production`
- [ ] Set `APP_DEBUG=false` (CRITICAL - never true in production!)
- [ ] Generate unique `APP_KEY` for each service
- [ ] Update `APP_URL` to production domain
- [ ] Configure `APP_TIMEZONE=Asia/Jakarta`
- [ ] Configure `APP_LOCALE=id`

### 2. Database Configuration
- [ ] Use strong database passwords (min 16 characters, mixed case, numbers, symbols)
- [ ] Create separate database users per service (principle of least privilege)
- [ ] Enable SSL/TLS for database connections
- [ ] Regular automated backups (daily at minimum)
- [ ] Configure connection pooling for performance

### 3. Authentication & Security
- [ ] Generate new `JWT_SECRET` (64+ random characters)
- [ ] Configure session lifetime appropriately
- [ ] Enable HTTPS only (no HTTP)
- [ ] Configure CORS properly (whitelist specific domains)
- [ ] Implement rate limiting on APIs
- [ ] Configure Sanctum for token management

### 4. Cache & Performance
- [ ] Use Redis for caching (`CACHE_DRIVER=redis`)
- [ ] Use Redis for sessions (`SESSION_DRIVER=redis`)
- [ ] Use Redis for queues (`QUEUE_CONNECTION=redis`)
- [ ] Configure Redis password
- [ ] Set up queue workers as systemd services

### 5. Email Configuration
- [ ] Configure production SMTP server
- [ ] Use authenticated SMTP
- [ ] Enable MAIL_ENCRYPTION=tls
- [ ] Set proper FROM address and name
- [ ] Test email delivery

### 6. File Storage
- [ ] Configure MinIO or S3 for file storage
- [ ] Use secure credentials
- [ ] Configure bucket permissions
- [ ] Enable backup for uploaded files

### 7. Monitoring & Logging
- [ ] Configure centralized logging (ELK stack)
- [ ] Set up error tracking (Sentry)
- [ ] Configure performance monitoring
- [ ] Set up health check endpoints
- [ ] Configure log rotation

---

## 📋 Production .env Template

```dotenv
# =================================================================
# IMSQuty Production Configuration
# Service: [SERVICE_NAME]
# Environment: Production
# Timezone: Asia/Jakarta (WIB, UTC+7)
# Locale: Indonesian (id)
# Last Updated: January 8, 2026
# =================================================================

# -----------------------------------------------------------------
# APPLICATION SETTINGS
# -----------------------------------------------------------------
APP_NAME="IMSQuty [Service Name]"
APP_ENV=production
APP_KEY=base64:[GENERATE_WITH: php artisan key:generate]
APP_DEBUG=false
APP_URL=https://[your-domain.com]
APP_TIMEZONE=Asia/Jakarta
APP_LOCALE=id
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=id_ID

# -----------------------------------------------------------------
# LOGGING
# -----------------------------------------------------------------
LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error
LOG_SLACK_WEBHOOK_URL=[OPTIONAL]

# -----------------------------------------------------------------
# DATABASE CONFIGURATION
# -----------------------------------------------------------------
DB_CONNECTION=mysql
DB_HOST=[production-db-host]
DB_PORT=3306
DB_DATABASE=[service_database_name]
DB_USERNAME=[service_db_user]
DB_PASSWORD=[STRONG_PASSWORD_HERE]
DB_SSL_MODE=REQUIRED
DB_SSL_CA=/path/to/ca-cert.pem

# Connection Pool Settings
DB_POOL_MIN=2
DB_POOL_MAX=10

# -----------------------------------------------------------------
# CACHE CONFIGURATION (Redis)
# -----------------------------------------------------------------
CACHE_DRIVER=redis
CACHE_PREFIX=[service_name]_cache

# -----------------------------------------------------------------
# SESSION CONFIGURATION
# -----------------------------------------------------------------
SESSION_DRIVER=redis
SESSION_LIFETIME=120
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=lax

# -----------------------------------------------------------------
# QUEUE CONFIGURATION
# -----------------------------------------------------------------
QUEUE_CONNECTION=redis
QUEUE_PREFIX=[service_name]

# -----------------------------------------------------------------
# REDIS CONFIGURATION
# -----------------------------------------------------------------
REDIS_HOST=[production-redis-host]
REDIS_PASSWORD=[STRONG_REDIS_PASSWORD]
REDIS_PORT=6379
REDIS_CLIENT=phpredis
REDIS_CLUSTER=false

# Redis Sentinel (if using)
# REDIS_SENTINELS=[host1:port1,host2:port2]
# REDIS_SENTINEL_SERVICE=mymaster

# -----------------------------------------------------------------
# MAIL CONFIGURATION
# -----------------------------------------------------------------
MAIL_MAILER=smtp
MAIL_HOST=[smtp-server]
MAIL_PORT=587
MAIL_USERNAME=[smtp-username]
MAIL_PASSWORD=[smtp-password]
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@[your-domain].com"
MAIL_FROM_NAME="${APP_NAME}"

# -----------------------------------------------------------------
# FILE STORAGE (MinIO/S3)
# -----------------------------------------------------------------
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=[minio-access-key]
AWS_SECRET_ACCESS_KEY=[minio-secret-key]
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=[service-bucket-name]
AWS_URL=[https://minio.your-domain.com]
AWS_ENDPOINT=[https://minio.your-domain.com]
AWS_USE_PATH_STYLE_ENDPOINT=true

# -----------------------------------------------------------------
# AUTHENTICATION (JWT)
# -----------------------------------------------------------------
JWT_SECRET=[GENERATE_64_CHAR_RANDOM_STRING]
JWT_TTL=60
JWT_REFRESH_TTL=20160
JWT_ALGO=HS256

# Sanctum Configuration
SANCTUM_STATEFUL_DOMAINS=[your-domain.com,www.your-domain.com]
SESSION_DOMAIN=.[your-domain.com]

# -----------------------------------------------------------------
# CORS CONFIGURATION
# -----------------------------------------------------------------
CORS_ALLOWED_ORIGINS=https://[your-domain.com],https://www.[your-domain.com]
CORS_ALLOWED_METHODS=GET,POST,PUT,PATCH,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With
CORS_EXPOSED_HEADERS=
CORS_MAX_AGE=3600
CORS_SUPPORTS_CREDENTIALS=true

# -----------------------------------------------------------------
# RATE LIMITING
# -----------------------------------------------------------------
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_LOGIN_ATTEMPTS=5
RATE_LIMIT_LOGIN_DECAY_MINUTES=15

# -----------------------------------------------------------------
# MONITORING & PERFORMANCE
# -----------------------------------------------------------------
# Sentry Error Tracking
SENTRY_LARAVEL_DSN=[your-sentry-dsn]
SENTRY_TRACES_SAMPLE_RATE=0.1

# New Relic (Optional)
NEWRELIC_ENABLED=false
NEWRELIC_LICENSE_KEY=[your-license-key]
NEWRELIC_APP_NAME="${APP_NAME}"

# -----------------------------------------------------------------
# MICROSERVICES ENDPOINTS
# -----------------------------------------------------------------
AUTH_SERVICE_URL=https://auth.[your-domain].com
ASSET_SERVICE_URL=https://asset.[your-domain].com
TICKET_SERVICE_URL=https://ticket.[your-domain].com
USER_SERVICE_URL=https://user.[your-domain].com
MEETING_ROOM_SERVICE_URL=https://meeting.[your-domain].com
FINANCIAL_SERVICE_URL=https://financial.[your-domain].com
INVENTORY_SERVICE_URL=https://inventory.[your-domain].com
NOTIFICATION_SERVICE_URL=https://notification.[your-domain].com
REPORTING_SERVICE_URL=https://reporting.[your-domain].com
MASTER_DATA_SERVICE_URL=https://masterdata.[your-domain].com

# -----------------------------------------------------------------
# API GATEWAY
# -----------------------------------------------------------------
API_GATEWAY_URL=https://api.[your-domain].com
API_VERSION=v1

# -----------------------------------------------------------------
# NOTIFICATION CHANNELS
# -----------------------------------------------------------------
# Telegram Bot
TELEGRAM_BOT_TOKEN=[your-bot-token]
TELEGRAM_CHANNEL_ID=[your-channel-id]

# Slack Webhook (Optional)
SLACK_WEBHOOK_URL=[your-slack-webhook]

# -----------------------------------------------------------------
# BACKUP CONFIGURATION
# -----------------------------------------------------------------
BACKUP_DISK=s3
BACKUP_NOTIFICATION_EMAIL=admin@[your-domain].com
BACKUP_SCHEDULE="0 2 * * *"  # Daily at 2 AM WIB

# -----------------------------------------------------------------
# SSL/TLS CERTIFICATES
# -----------------------------------------------------------------
SSL_CERT_PATH=/etc/letsencrypt/live/[your-domain]/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/[your-domain]/privkey.pem

# -----------------------------------------------------------------
# ADDITIONAL SERVICE-SPECIFIC CONFIGURATIONS
# -----------------------------------------------------------------
# Add service-specific environment variables here

```

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All environment variables configured
- [ ] Database migrations tested
- [ ] SSL certificates obtained and installed
- [ ] DNS records configured
- [ ] Firewall rules configured
- [ ] Load balancer configured (if applicable)

### Deployment Steps
1. [ ] Backup current production database (if updating)
2. [ ] Deploy new code to production servers
3. [ ] Run database migrations: `php artisan migrate --force`
4. [ ] Clear and optimize caches:
   ```bash
   php artisan config:clear
   php artisan cache:clear
   php artisan route:clear
   php artisan view:clear
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```
5. [ ] Restart queue workers
6. [ ] Restart web servers (PHP-FPM, Nginx)
7. [ ] Verify health check endpoints
8. [ ] Monitor error logs for 30 minutes

### Post-Deployment
- [ ] Test critical user flows
- [ ] Verify all dashboards loading
- [ ] Check API endpoints responding
- [ ] Verify authentication working
- [ ] Test file upload/download
- [ ] Check email notifications
- [ ] Review monitoring dashboards

---

## 🔐 Security Best Practices

### 1. Password Requirements
- **Database Passwords**: Minimum 16 characters, mixed case, numbers, symbols
- **JWT Secret**: Minimum 64 random characters
- **Redis Password**: Minimum 24 random characters
- **API Keys**: Use environment-specific keys, rotate regularly

### 2. Generate Strong Passwords
```bash
# Generate strong password (Linux/Mac)
openssl rand -base64 32

# Generate JWT secret (64 characters)
openssl rand -hex 32
```

### 3. File Permissions
```bash
# Set proper permissions
chmod 755 /path/to/project
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data /path/to/project

# Protect sensitive files
chmod 600 .env
```

### 4. Firewall Configuration
```bash
# Allow only necessary ports
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP (redirect to HTTPS)
ufw allow 443/tcp     # HTTPS
ufw allow 3306/tcp    # MySQL (only from app servers)
ufw allow 6379/tcp    # Redis (only from app servers)
ufw enable
```

---

## 📊 Monitoring Setup

### Health Check Endpoints
All services should expose:
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed status (database, cache, etc.)

### Recommended Monitoring Tools
1. **Uptime Monitoring**: UptimeRobot, Pingdom
2. **Error Tracking**: Sentry
3. **Performance**: New Relic, DataDog
4. **Log Management**: ELK Stack (Elasticsearch, Logstash, Kibana)
5. **Infrastructure**: Prometheus + Grafana

---

## 🗄️ Database Migration Strategy

### Safety Procedures (CRITICAL)

#### 1. Pre-Migration Backup
```bash
# Full database backup
mysqldump -u root -p --all-databases > backup_$(date +%Y%m%d_%H%M%S).sql

# Specific database backup
mysqldump -u root -p imsquty > imsquty_backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
mysqldump -u root -p imsquty | gzip > imsquty_backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

#### 2. Test Environment Setup
```bash
# Create test database
CREATE DATABASE imsquty_test;

# Import backup to test
mysql -u root -p imsquty_test < backup.sql

# Test migrations on test database
php artisan migrate --database=test --force
```

#### 3. Migration Validation
- [ ] Verify all tables created
- [ ] Check foreign key constraints
- [ ] Validate data integrity
- [ ] Test application with new schema
- [ ] Performance test with production data volume

#### 4. Rollback Plan
```bash
# If migration fails, rollback:
mysql -u root -p imsquty < backup_YYYYMMDD_HHMMSS.sql

# Or use Laravel rollback:
php artisan migrate:rollback --step=1
```

---

## 📝 Seeder Management

### Disable Test Seeders in Production

Edit `database/seeders/DatabaseSeeder.php` in each service:

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // PRODUCTION: Only run essential seeders
        if (app()->environment('production')) {
            $this->call([
                // Essential reference data only
                StatusesSeeder::class,
                // Do NOT call test data seeders in production
            ]);
        } else {
            // DEVELOPMENT/STAGING: Run all seeders including test data
            $this->call([
                StatusesSeeder::class,
                DivisionsSeeder::class,
                LocationsSeeder::class,
                // ... other seeders
            ]);
        }
    }
}
```

---

## 🌐 Domain & SSL Configuration

### Domain Structure (Recommended)
```
Main Domain: imsquty.your-company.com
API Gateway: api.imsquty.your-company.com

Microservices (internal):
- auth.internal.imsquty.com
- asset.internal.imsquty.com
- ticket.internal.imsquty.com
- ... (other services)

Frontend: app.imsquty.your-company.com
Admin Panel: admin.imsquty.your-company.com
```

### SSL Certificate (Let's Encrypt)
```bash
# Install certbot
apt-get install certbot python3-certbot-nginx

# Obtain certificate
certbot --nginx -d imsquty.your-company.com -d api.imsquty.your-company.com

# Auto-renewal (should be automatic, verify with)
certbot renew --dry-run
```

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue: Database connection failed**
- Check DB_HOST, DB_PORT are correct
- Verify database user has proper permissions
- Ensure firewall allows connection
- Check SSL certificates if using SSL

**Issue: Cache not working**
- Verify Redis is running: `redis-cli ping`
- Check REDIS_PASSWORD is correct
- Ensure Redis port is accessible
- Clear cache: `php artisan cache:clear`

**Issue: Queue jobs not processing**
- Check queue worker is running: `systemctl status laravel-queue`
- Restart workers: `php artisan queue:restart`
- Check queue connection: `php artisan queue:work --once`

**Issue: Sessions not persisting**
- Verify SESSION_DRIVER=redis
- Check Redis connection
- Ensure SESSION_DOMAIN is correct for production

---

## 📧 Contact Information

For production deployment assistance:
- **Technical Lead**: [Name] ([email])
- **DevOps Team**: [email]
- **Emergency Hotline**: [phone]

---

**Document Version**: 1.0.0  
**Last Updated**: January 8, 2026  
**Maintained By**: IMSQuty Development Team
