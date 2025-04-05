#!/bin/bash

# Login to get token
TOKEN=$(curl -s -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser2","password":"password123"}' | 
  grep -o '"access_token":"[^"]*"' | 
  sed 's/"access_token":"//' | 
  sed 's/"//')

echo "Token obtained: ${TOKEN:0:20}..."

# Create a test webhook payload - especially intended for testing
cat <<EOT > test_webhook_payload.json
{
  "id": "evt_test_webhook_$(date +%s)",
  "object": "event",
  "api_version": "2023-10-16",
  "created": $(date +%s),
  "data": {
    "object": {
      "id": "cs_test_$(openssl rand -hex 16)",
      "object": "checkout.session",
      "payment_status": "paid",
      "status": "complete",
      "customer_details": {
        "email": "test@example.com",
        "name": "Test User"
      },
      "metadata": {
        "user_id": "2",
        "package_id": "lite_monthly",
        "credits": "50",
        "price": "9.9",
        "is_yearly": "false",
        "test_mode": "true"
      }
    }
  },
  "type": "checkout.session.completed"
}
EOT

# Send the webhook
echo "Sending test webhook..."
WEBHOOK_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/payment/webhook" \
  -H "Content-Type: application/json" \
  -d @test_webhook_payload.json)

echo "Webhook response: $WEBHOOK_RESPONSE"

# Extract the session ID from the webhook payload
SESSION_ID=$(grep -o '"id": "cs_test_[^"]*"' test_webhook_payload.json | head -1 | sed 's/"id": "//' | sed 's/"//')
echo "Session ID extracted: $SESSION_ID"

# Verify the payment
echo "Verifying payment..."
sleep 2  # Give some time for webhook processing
VERIFY_RESPONSE=$(curl -s "http://localhost:3000/api/payment/verify?session_id=$SESSION_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Verification response: $VERIFY_RESPONSE"

# Check user's updated credits
echo "Checking user credits..."
USER_INFO=$(curl -s "http://localhost:3000/api/auth/user" \
  -H "Authorization: Bearer $TOKEN")

echo "User info: $USER_INFO"
