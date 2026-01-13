# Multi-stage build for Auth Service
FROM php:8.4-cli AS base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    libicu-dev \
    && docker-php-ext-configure intl \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip intl

# Install Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy composer files
COPY services/auth-service/composer.json services/auth-service/composer.lock ./

# Copy shared folder (needed for autoload)
COPY shared /var/www/shared

# Install dependencies
RUN composer install --no-scripts --no-autoloader --prefer-dist --no-dev

# Copy application code
COPY services/auth-service/ .

# Generate autoload files
RUN composer dump-autoload --optimize

# Install netcat for database connectivity check
RUN apt-get update && apt-get install -y netcat-openbsd

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Create non-root user
RUN groupadd -g 1000 imsquty && \
    useradd -u 1000 -g imsquty -m imsquty

# Copy entrypoint script
COPY services/auth-service/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

USER imsquty

# Expose port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8001/api/v1/health || exit 1

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
