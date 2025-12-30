# Multi-stage build for Meeting Room Service
FROM php:8.2-fpm-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    bash \
    curl \
    git \
    zip \
    unzip \
    mysql-client \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    icu-dev \
    libzip-dev

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    pdo \
    pdo_mysql \
    mysqli \
    bcmath \
    gd \
    zip \
    intl \
    opcache

# Install Redis extension
RUN apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .build-deps

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/meeting-room-service

# Copy composer files
COPY composer.json composer.lock ./

# Install dependencies
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# Copy application files
COPY . .

# Generate optimized autoloader
RUN composer dump-autoload --optimize --no-dev

# Set permissions
RUN chown -R www-data:www-data /var/www/meeting-room-service \
    && chmod -R 755 /var/www/meeting-room-service/storage \
    && chmod -R 755 /var/www/meeting-room-service/bootstrap/cache

# Configure PHP
RUN echo "memory_limit = 256M" > /usr/local/etc/php/conf.d/custom.ini && \
    echo "upload_max_filesize = 20M" >> /usr/local/etc/php/conf.d/custom.ini && \
    echo "post_max_size = 20M" >> /usr/local/etc/php/conf.d/custom.ini && \
    echo "max_execution_time = 300" >> /usr/local/etc/php/conf.d/custom.ini && \
    echo "opcache.enable = 1" >> /usr/local/etc/php/conf.d/custom.ini && \
    echo "opcache.memory_consumption = 128" >> /usr/local/etc/php/conf.d/custom.ini && \
    echo "opcache.interned_strings_buffer = 8" >> /usr/local/etc/php/conf.d/custom.ini && \
    echo "opcache.max_accelerated_files = 10000" >> /var/www/meeting-room-service/docker/php.ini && \
    echo "opcache.revalidate_freq = 2" >> /var/www/meeting-room-service/docker/php.ini && \
    cp /var/www/meeting-room-service/docker/php.ini /usr/local/etc/php/conf.d/custom.ini

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD php artisan --version || exit 1

EXPOSE 8000

# Start PHP-FPM and Laravel server
CMD php artisan config:cache && \
    php artisan route:cache && \
    php artisan serve --host=0.0.0.0 --port=8000
