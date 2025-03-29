#!/bin/bash

# Terminal 1: Start Flask backend
cd backend && python run.py &
FLASK_PID=$!
echo "Flask backend started with PID: $FLASK_PID"

# Wait for Flask to start up
sleep 3

# Terminal 2: Start frontend dev server
cd frontend && npm run dev &
FRONTEND_PID=$!
echo "Frontend dev server started with PID: $FRONTEND_PID"

# Function to kill both processes on exit
cleanup() {
    echo "Shutting down servers..."
    kill $FLASK_PID
    kill $FRONTEND_PID
    exit 0
}

# Register the cleanup function for when the script is terminated
trap cleanup INT TERM

# Keep the script running
echo "Both servers are now running. Press Ctrl+C to stop both."
wait