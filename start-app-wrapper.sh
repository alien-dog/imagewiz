#!/bin/bash

# This wrapper script will be called by the Replit workflow
# It will in turn execute our Node.js script that manages both backend and frontend

echo "Starting iMagenWiz application via wrapper script..."

# Start our custom runner script
node run_both.js