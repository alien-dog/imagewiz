#!/bin/bash

# Set your Repl URL here (replace with the actual URL)
BASE_URL="http://localhost:3000"
# If testing deployed app, use this instead:
# BASE_URL="https://your-project-url.replit.app"

# Step 1: Login to get a JWT token
echo "Logging in to get auth token..."
TOKEN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser2","password":"password123"}')

# Extract the token from the response
TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Failed to get token. Response: $TOKEN_RESPONSE"
  exit 1
fi

echo "Got token: ${TOKEN:0:20}..."

# Step 2: Get user info using the token
echo -e "\nFetching user info..."
curl -s -X GET "${BASE_URL}/api/auth/user" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Step 3: Get pricing packages
echo -e "\nFetching pricing packages..."
curl -s -X GET "${BASE_URL}/api/payment/packages" | jq .

# Step 4: Create a checkout session for the basic package
echo -e "\nCreating checkout session for basic package..."
SUCCESS_URL="${BASE_URL}/payment-success"
CANCEL_URL="${BASE_URL}/pricing"

curl -s -X POST "${BASE_URL}/api/payment/create-checkout-session" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"package_id\":\"basic\",\"success_url\":\"$SUCCESS_URL\",\"cancel_url\":\"$CANCEL_URL\"}" | jq .

# Optional: Step 5 - Verify a payment (this would normally happen after Stripe redirect)
# This step is just to test the API, not to complete a real payment
echo -e "\nVerifying payment (test only - would normally happen after Stripe redirect)..."
echo "Note: This will likely fail with 'Payment not found' since we didn't complete a real payment"

# Using a fake session_id just to test the API
curl -s -X GET "${BASE_URL}/api/payment/verify-payment?session_id=cs_test_fake_session_id" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Step 6: Get payment history
echo -e "\nFetching payment history..."
curl -s -X GET "${BASE_URL}/api/payment/history" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo -e "\nTest flow completed!"
