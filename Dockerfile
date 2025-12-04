FROM php:8.2-fpm

# Установим Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

# Установим зависимости проекта
RUN composer install --no-dev --optimize-autoloader
