#!/bin/bash

# This script tests the full payment flow including order fulfillment
# for the iMagenWiz application.

# Login to get token
TOKEN=$(curl -s -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser2","password":"password123"}' | 
  grep -o '"access_token":"[^"]*"' | 
  sed 's/"access_token":"//' | 
  sed 's/"//')

echo "Token obtained: ${TOKEN:0:20}..."

# Get user's current credit balance
USER_INFO=$(curl -s "http://localhost:3000/api/auth/user" \
  -H "Authorization: Bearer $TOKEN")

INITIAL_BALANCE=$(echo "$USER_INFO" | grep -o '"credits":[0-9]*' | cut -d ":" -f2)
echo "Initial credit balance: $INITIAL_BALANCE"

# Create a checkout session
echo "Creating checkout session..."
CHECKOUT_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/payment/create-checkout-session" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"package_id":"lite_monthly","is_yearly":false,"price":9.9}')

echo "Checkout response: $CHECKOUT_RESPONSE"

# Extract the session ID
SESSION_ID=$(echo "$CHECKOUT_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"//;s/"//')
echo "Session ID: $SESSION_ID"

# Generate test webhook payload with this valid session ID
cat <<EOT > test_webhook_paid.json
{
  "id": "evt_test_webhook_paid_$(date +%s)",
  "object": "event",
  "api_version": "2023-10-16",
  "created": $(date +%s),
  "data": {
    "object": {
      "id": "$SESSION_ID",
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
        "force_test_success": "true"
      }
    }
  },
  "type": "checkout.session.completed"
}
EOT

# Sleep to ensure session is created in Stripe
echo "Waiting for session to be fully processed..."
sleep 2

# Send webhook to trigger payment processing
echo "Sending webhook to trigger payment processing..."
WEBHOOK_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/payment/webhook" \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: t=1234,v1=dummy" \
  -d @test_webhook_paid.json)

echo "Webhook response: $WEBHOOK_RESPONSE"

# Wait for the webhook to be processed
echo "Waiting for webhook processing..."
sleep 3

# Verify the payment
echo "Verifying payment status..."
for i in {1..3}; do
  echo "Verification attempt $i..."
  VERIFY_RESPONSE=$(curl -s "http://localhost:3000/api/payment/verify?session_id=$SESSION_ID" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "Verification response: $VERIFY_RESPONSE"
  
  # Check if payment was successful
  SUCCESS_CHECK=$(echo "$VERIFY_RESPONSE" | grep -o '"status":"success"')
  if [[ -n "$SUCCESS_CHECK" ]]; then
    echo "Payment verified successfully!"
    break
  fi
  
  sleep 2
done

# Check user's updated credit balance
echo "Checking for updated credit balance..."
UPDATED_USER_INFO=$(curl -s "http://localhost:3000/api/auth/user" \
  -H "Authorization: Bearer $TOKEN")

FINAL_BALANCE=$(echo "$UPDATED_USER_INFO" | grep -o '"credits":[0-9]*' | cut -d ":" -f2)
echo "Final credit balance: $FINAL_BALANCE"

# Calculate and display the difference
CREDITS_ADDED=$((FINAL_BALANCE - INITIAL_BALANCE))
echo "Credits added: $CREDITS_ADDED"

if [[ "$CREDITS_ADDED" -gt 0 ]]; then
  echo "✅ TEST PASSED: Credits were successfully added to the user's account"
else
  echo "❌ TEST FAILED: No credits were added to the user's account"
fi
