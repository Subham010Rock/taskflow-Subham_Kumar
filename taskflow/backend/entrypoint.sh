#!/bin/sh
set -e

echo "⏳ Waiting for PostgreSQL to be ready..."

# Wait for PostgreSQL to accept connections
until pg_isready -h db -p 5432 -U "$POSTGRES_USER" 2>/dev/null; do
  echo "PostgreSQL is not ready yet. Retrying in 2 seconds..."
  sleep 2
done

echo "✅ PostgreSQL is ready!"

echo "🔄 Running database migrations..."
dbmate --url "$DATABASE_URL" --migrations-dir ./db/migrations up

echo "🌱 Running seed data..."
# Only seed if the users table is empty (avoid duplicate seeds)
SEED_CHECK=$(PGPASSWORD="$POSTGRES_PASSWORD" psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "0")

if [ "$(echo "$SEED_CHECK" | tr -d ' ')" = "0" ]; then
  PGPASSWORD="$POSTGRES_PASSWORD" psql "$DATABASE_URL" -f ./db/seed.sql
  echo "✅ Seed data inserted!"
else
  echo "⏭️  Seed data already exists, skipping."
fi

echo "🚀 Starting the API server..."
exec node src/index.js