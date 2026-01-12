# Multi-stage build for User Service
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
COPY services/user-service/composer.json services/user-service/composer.lock ./

# Copy shared folder to the application directory (needed for autoload)
COPY shared ./shared

# Install dependencies
RUN composer install --no-scripts --no-autoloader --prefer-dist --no-dev

# Copy application code
COPY services/user-service/ .

# Generate autoload files
RUN composer dump-autoload --optimize

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Create non-root user
RUN groupadd -g 1000 imsquty && \
    useradd -u 1000 -g imsquty -m imsquty

USER imsquty

# Expose port
EXPOSE 8002

# Start PHP-FPM and Laravel serve
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8002"]
