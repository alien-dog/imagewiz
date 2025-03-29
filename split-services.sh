#!/bin/bash

# This script helps set up folder structure and copy necessary files

# Create folders if they don't exist
mkdir -p frontend/src/components/ui
mkdir -p frontend/src/components/layout
mkdir -p frontend/src/contexts
mkdir -p frontend/src/pages
mkdir -p frontend/src/lib
mkdir -p frontend/src/hooks
mkdir -p frontend/src/utils
mkdir -p frontend/public

mkdir -p backend/app/static/uploads
mkdir -p backend/app/static/processed

# Create sample .env files 
cat > frontend/.env <<EOL
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY
EOL

# Confirm completion
echo "Folder structure has been set up!"
echo "Backend in /backend"
echo "Frontend in /frontend"
echo "Node.js proxy in /server"