#!/bin/bash

# Default values
USERNAME="testuser2"
PASSWORD="password123"
API_URL="http://localhost:5000"
PLAN_ID=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --username=*)
      USERNAME="${1#*=}"
      shift
      ;;
    --password=*)
      PASSWORD="${1#*=}"
      shift
      ;;
    --api-url=*)
      API_URL="${1#*=}"
      shift
      ;;
    --plan=*)
      PLAN_ID="${1#*=}"
      shift
      ;;
    --help)
      echo "Usage: $0 [options]"
      echo "Options:"
      echo "  --username=USERNAME    Login username (default: testuser2)"
      echo "  --password=PASSWORD    Login password (default: password123)"
      echo "  --api-url=URL          API URL (default: http://localhost:5000)"
      echo "  --plan=PLAN_ID         Test only one plan (lite_monthly, lite_yearly, pro_monthly, pro_yearly)"
      echo "  --help                 Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

echo "🔐 Logging in as $USERNAME..."
TOKEN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}" $API_URL/api/auth/login)

# Extract the token
AUTH_TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//')

if [ -z "$AUTH_TOKEN" ]; then
    echo "❌ Failed to obtain auth token. Login response:"
    echo $TOKEN_RESPONSE
    exit 1
fi

echo "✅ Auth token obtained!"

if [ -n "$PLAN_ID" ]; then
    echo "🧪 Testing plan: $PLAN_ID"
    PLAN_ID=$PLAN_ID AUTH_TOKEN=$AUTH_TOKEN API_BASE_URL="$API_URL" node test-payments.js
else
    echo "🧪 Testing all plans..."
    AUTH_TOKEN=$AUTH_TOKEN API_BASE_URL="$API_URL" node test-payments.js
fi