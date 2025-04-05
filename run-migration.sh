#!/bin/bash
# Script to run the migration for adding is_yearly and package_id columns to the recharge_history table

# Set environment variables if they aren't already set
export MYSQL_HOST=${MYSQL_HOST:-"8.130.113.102"}
export MYSQL_USER=${MYSQL_USER:-"root"}
export MYSQL_PASSWORD=${MYSQL_PASSWORD:-"Ir%86241992"}
export MYSQL_DB=${MYSQL_DB:-"mat_db"}

echo "Running database migration to add columns to recharge_history table..."
echo "Database: $MYSQL_USER@$MYSQL_HOST/$MYSQL_DB"

echo "Activating Python environment if needed..."
# Run the migration script
cd backend
python -m app.utils.migrate_recharge_history

echo "Migration completed"
