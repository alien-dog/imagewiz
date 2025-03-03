#!/bin/bash

# Create directories if they don't exist
mkdir -p frontend/src/{components,hooks,lib,pages}
mkdir -p backend/src

echo "Moving frontend files..."
# Copy files from client to frontend, preserving existing files
cp -r client/src/* frontend/src/ 2>/dev/null || true

echo "Moving backend files..."
# Move server files to backend
cp -r server/* backend/src/ 2>/dev/null || true
cp -r shared backend/src/ 2>/dev/null || true

echo "Copying configuration files..."
# Copy configuration files
cp tsconfig.json frontend/ 2>/dev/null || true
cp tsconfig.json backend/ 2>/dev/null || true
cp tailwind.config.ts frontend/ 2>/dev/null || true
cp postcss.config.js frontend/ 2>/dev/null || true
cp theme.json frontend/ 2>/dev/null || true
cp vite.config.ts frontend/ 2>/dev/null || true

# Set up environment files
echo "VITE_API_URL=http://localhost:3000" > frontend/.env
echo "VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}" >> frontend/.env

echo "CORS_ORIGIN=http://localhost:5173" > backend/.env
echo "DATABASE_URL=${DATABASE_URL}" >> backend/.env
echo "SESSION_SECRET=${SESSION_SECRET}" >> backend/.env


cat > frontend/README.md << EOL
# iMagenWiz Frontend

This is the frontend service for iMagenWiz, an AI-powered image processing platform.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a .env file with:
   ```
   VITE_API_URL=http://localhost:3000
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

## Build
```bash
npm run build
```

## Production
```bash
npm run preview
```
EOL

cat > backend/README.md << EOL
# iMagenWiz Backend

This is the backend service for iMagenWiz, an AI-powered image processing platform.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a .env file with:
   ```
   DATABASE_URL=your_database_url
   STRIPE_SECRET_KEY=your_stripe_secret_key
   SESSION_SECRET=your_session_secret
   CORS_ORIGIN=http://localhost:5173
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

## Build
```bash
npm run build
```

## Production
```bash
npm start
```
EOL

echo "Services have been separated into frontend and backend directories."
echo "Please review the files and start each service separately:"
echo "- Frontend: cd frontend && npm run dev"
echo "- Backend: cd backend && npm run dev"