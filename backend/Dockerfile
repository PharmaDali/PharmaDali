# ---- Stage 1: Build Vite Assets ----
FROM node:20-alpine AS node-builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY vite.config.js ./
COPY resources/ ./resources/
COPY public/ ./public/

RUN npm run build


# ---- Stage 2: PHP-FPM Application ----
FROM php:8.4-fpm-alpine AS php-fpm

# Install system dependencies and PHP extensions
RUN apk add --no-cache --virtual .build-deps \
        $PHPIZE_DEPS \
        linux-headers \
    && apk add --no-cache \
        git \
        curl \
        libpng-dev \
        oniguruma-dev \
        libxml2-dev \
        libzip-dev \
        icu-dev \
        freetype-dev \
        libjpeg-turbo-dev \
        zip \
        unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
        pdo_mysql \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        intl \
        zip \
        xml \
        opcache \
    && pecl install redis \
    && docker-php-ext-enable redis opcache \
    && apk del .build-deps \
    && rm -rf /tmp/pear

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Cache Composer layer: install dependencies before copying app code
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --optimize-autoloader --no-interaction

# Copy application source
COPY . .

# Copy compiled Vite assets from node-builder stage
COPY --from=node-builder /app/public/build ./public/build

# Provide dummy env variables so Laravel's package:discover doesn't crash on Pusher instantiation
ENV PUSHER_APP_ID="build-dummy-id" \
    PUSHER_APP_KEY="build-dummy-key" \
    PUSHER_APP_SECRET="build-dummy-secret" \
    REVERB_APP_ID="build-dummy-id" \
    REVERB_APP_KEY="build-dummy-key" \
    REVERB_APP_SECRET="build-dummy-secret"

# Regenerate autoloader to include application classes
RUN composer dump-autoload --optimize --no-interaction

# Set correct permissions for the web server user
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 9000
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["php-fpm"]


# ---- Stage 3: Nginx Web Server ----
FROM nginx:1.27-alpine AS web

# Copy only the compiled static assets nginx needs to serve directly
COPY --from=node-builder /app/public/build /var/www/public/build

COPY docker/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
