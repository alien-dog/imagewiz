#!/bin/bash

# Navigate to the backend directory
cd backend

# Run the migration script
echo "Running database migration script..."
python -m app.utils.migrate_recharge_history

echo "Migration completed."