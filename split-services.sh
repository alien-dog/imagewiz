#!/bin/bash

# We're using a remote Flask backend, so no need to start it here
echo "Using remote Flask backend"

# Terminal: Start Node.js server which proxies to remote Flask
npx tsx server/index.ts &
SERVER_PID=$!
echo "Express server started with PID: $SERVER_PID"

# Function to kill the server process on exit
cleanup() {
    echo "Shutting down server..."
    kill $SERVER_PID
    exit 0
}

# Register the cleanup function for when the script is terminated
trap cleanup INT TERM

# Keep the script running
echo "Both servers are now running. Press Ctrl+C to stop both."
wait