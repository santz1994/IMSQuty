# Multi-stage build for Master Data Service
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
COPY services/master-data-service/composer.json services/master-data-service/composer.lock ./

# Copy shared folder (needed for autoload)
COPY shared /var/www/shared

# Install dependencies
RUN composer install --no-scripts --no-autoloader --prefer-dist --no-dev

# Copy application code
COPY services/master-data-service/ .

# Generate autoload files
RUN composer dump-autoload --optimize

# Create non-root user
RUN groupadd -g 1000 imsquty && \
    useradd -u 1000 -g imsquty -m imsquty

# Set permissions
RUN chown -R imsquty:imsquty /var/www/html \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

USER imsquty

# Expose port
EXPOSE 8008

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD php artisan inspire || exit 1

# Start Laravel development server
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8008"]
