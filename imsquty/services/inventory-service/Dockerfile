FROM php:8.4-fpm

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
COPY composer.json composer.lock ./

# Install dependencies
RUN composer install --no-scripts --no-autoloader --prefer-dist --no-dev

# Copy application code
COPY . .

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
EXPOSE 8005

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD ps aux | grep -q '[p]hp-fpm' || exit 1

# Start PHP FPM
CMD ["php-fpm"]
