#!/bin/bash

# Start the Flask backend
cd backend && python run.py &

# Remember backend PID
BACKEND_PID=$!

# Wait a moment to ensure backend starts up
sleep 2

# Start the React frontend
cd frontend && npm run dev &

# Remember frontend PID
FRONTEND_PID=$!

# Wait for either process to exit
wait $BACKEND_PID $FRONTEND_PID

# If we get here, one of the processes has exited
# Kill the other one
kill $BACKEND_PID 2>/dev/null
kill $FRONTEND_PID 2>/dev/null

# Exit with the same status as the process that exited
exit 0