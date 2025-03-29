#!/bin/bash

# Navigate to frontend directory
cd frontend

# Install dependencies if needed
npm install

# Build the frontend
npm run build

echo "Frontend built successfully! Files are in frontend/dist"