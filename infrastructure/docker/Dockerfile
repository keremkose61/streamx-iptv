# ==============================================================================
# StreamX IPTV - Production Multi-Stage Dockerfile (PHP 8.3 FPM + Extensions)
# ==============================================================================

FROM php:8.3-fpm-alpine AS base

# Install system dependencies and build libraries
RUN apk add --no-cache \
    curl \
    git \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    zip \
    unzip \
    oniguruma-dev \
    mysql-client \
    linux-headers \
    $PHPIZE_DEPS

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        zip \
        opcache

# Install Redis extension
RUN pecl install redis \
    && docker-php-ext-enable redis

# Install Composer
COPY --from=composer:2.8 /usr/bin/composer /usr/bin/composer

# Copy custom php.ini configuration
COPY infrastructure/docker/php.ini /usr/local/etc/php/conf.d/custom.ini

WORKDIR /var/www/html/backend

# Copy backend dependencies definition first for layer caching
COPY backend/composer.json backend/composer.lock ./

# Install composer production dependencies without scripts/autoloader yet
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# Copy full application code
COPY backend/ ./

# Generate optimized autoloader
RUN composer dump-autoload --optimize --no-dev

# Set permissions for storage and cache
RUN chown -R www-data:www-data /var/www/html/backend/storage /var/www/html/backend/bootstrap/cache \
    && chmod -R 775 /var/www/html/backend/storage /var/www/html/backend/bootstrap/cache

EXPOSE 9000

CMD ["php-fpm"]
