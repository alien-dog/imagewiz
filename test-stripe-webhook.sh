#!/bin/bash

# This script tests the fulfillment process through Stripe webhooks
# It simulates the webhook event that Stripe would send after a successful payment

# Set session ID to test with (this should be a test session ID)
SESSION_ID="cs_test_a1b2c3d4e5f6g7h8i9j0"

# Base URL of your application
BASE_URL="http://localhost:3000"

# Generate a mock Stripe webhook event payload for testing
cat > test_webhook_payload.json << EOL
{
  "id": "evt_test_webhook_${SESSION_ID}",
  "object": "event",
  "api_version": "2025-02-24",
  "created": $(date +%s),
  "data": {
    "object": {
      "id": "${SESSION_ID}",
      "object": "checkout.session",
      "amount_total": 990,
      "currency": "usd",
      "customer": "cus_test123456",
      "payment_status": "paid",
      "status": "complete",
      "client_reference_id": "2", 
      "metadata": {
        "package_id": "lite_monthly",
        "credit_amount": "50",
        "is_yearly": "false"
      }
    }
  },
  "type": "checkout.session.completed",
  "livemode": false
}
EOL

echo "Created test webhook payload for session ID: ${SESSION_ID}"

# Send the webhook to your application
echo "Sending webhook event to ${BASE_URL}/api/payment/webhook"
curl -v -X POST "${BASE_URL}/api/payment/webhook" \
  -H "Content-Type: application/json" \
  -d @test_webhook_payload.json

echo -e "\n\nTesting order confirmation with same session ID"
echo "Visit: ${BASE_URL}/order-confirmation?session_id=${SESSION_ID}"
echo -e "\nOr use the test page: ${BASE_URL}/test-order-confirmation.html"

echo -e "\nDone!"