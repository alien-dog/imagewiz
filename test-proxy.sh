#!/bin/bash

echo "===== Testing direct Flask endpoint ====="
echo -n '{"username":"testuser2","password":"password123"}' | curl -X POST -H "Content-Type: application/json" -d @- http://localhost:5000/auth/login

echo -e "\n\n===== Testing Express proxy endpoint ====="
echo -n '{"username":"testuser2","password":"password123"}' | curl -X POST -H "Content-Type: application/json" -d @- http://localhost:3000/api/auth/login