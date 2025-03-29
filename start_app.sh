#!/bin/bash

# Start the Flask backend in the background
cd backend && python run.py &
BACKEND_PID=$!

# Wait a bit for the backend to start
sleep 3

# Start the frontend
cd ../frontend && npm run dev

# If the frontend exits, kill the backend too
kill $BACKEND_PID