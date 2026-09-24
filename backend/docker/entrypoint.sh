#!/bin/sh
set -e

echo "Waiting for MySQL to accept connections..."
until php -r "
try {
    \$host = getenv('DB_HOST') ?: 'db';
    \$port = getenv('DB_PORT') ?: 3306;
    \$db   = getenv('DB_DATABASE');
    \$user = getenv('DB_USERNAME');
    \$pass = getenv('DB_PASSWORD');
    new PDO(\"mysql:host=\$host;port=\$port;dbname=\$db\", \$user, \$pass);
} catch (Exception \$e) {
    exit(1);
}
" 2>/dev/null; do
    echo "  Database not ready — retrying in 3s..."
    sleep 3
done
echo "Database is ready."

# Only the main PHP-FPM process runs migrations and warms the cache.
# queue-worker and reverb-server share this entrypoint but skip this block.
if [ "$1" = "php-fpm" ]; then
    echo "Running database migrations..."
    php artisan migrate --force || true

    echo "Creating public storage symlink..."
    php artisan storage:link 2>/dev/null || true

    echo "Warming application cache..."
    php artisan optimize
fi

exec "$@"
