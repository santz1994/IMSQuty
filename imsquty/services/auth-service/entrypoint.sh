#!/bin/bash

# Wait for database to be ready
echo "Waiting for database to be ready..."
until nc -z -v -w30 mysql 3306; do
    echo "Database is unavailable - sleeping"
    sleep 1
done
echo "Database is up"

# Run migrations
echo "Running migrations..."
php artisan migrate --force || echo "Migration warning (non-fatal)"

# Run seeders (ignore errors if data already exists)
echo "Running seeders..."
php artisan db:seed --force || echo "Seeder warning (data may already exist - continuing)"

# Start the application
echo "Starting Laravel application..."
exec php artisan serve --host=0.0.0.0 --port=8001
