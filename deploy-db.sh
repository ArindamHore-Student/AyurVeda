#!/bin/bash

# Fail on error
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Checking if seed flag is provided..."
if [ "$1" = "--seed" ]; then
  echo "Seeding the database..."
  npx prisma db seed
else
  echo "Skipping database seed..."
fi

echo "Database setup complete!" 