#!/bin/bash

# Get the JWT token and package_id from command line arguments
if [ "$1" == "" ] || [ "$2" == "" ]; then
  echo "Usage: ./test-payment-curl.sh <jwt_token> <package_id>"
  echo "Example: ./test-payment-curl.sh eyJhbGciOiJIUzI1NiIsI... basic"
  exit 1
fi

JWT_TOKEN=$1
PACKAGE_ID=$2
HOST="https://e3d010d3-10b7-4398-916c-9569531b7cb9-00-nzrxz81n08w.kirk.replit.dev"

# Get the current domain from Replit
if [ -n "$REPL_SLUG" ] && [ -n "$REPL_OWNER" ]; then
  HOST="https://$REPL_ID-00-$REPL_SLUG.$REPL_OWNER.replit.dev"
fi

# Define success and cancel URLs
SUCCESS_URL="${HOST}/payment-success"
CANCEL_URL="${HOST}/pricing"

echo "Making payment request for package: $PACKAGE_ID"
echo "Host: $HOST"
echo "Success URL: $SUCCESS_URL"
echo "Cancel URL: $CANCEL_URL"

# Create the payment session
RESPONSE=$(curl -s -X POST "${HOST}/api/payment/create-checkout-session" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -d "{\"package_id\":\"${PACKAGE_ID}\", \"success_url\":\"${SUCCESS_URL}\", \"cancel_url\":\"${CANCEL_URL}\"}")

echo "Response: $RESPONSE"

# Extract the checkout URL from the response
CHECKOUT_URL=$(echo $RESPONSE | grep -o '"url":"[^"]*"' | sed 's/"url":"\(.*\)"/\1/')

if [ -n "$CHECKOUT_URL" ]; then
  echo ""
  echo "Checkout URL: $CHECKOUT_URL"
  echo ""
  echo "To open this URL in your default browser (if available):"
  
  # Try to open in browser if available
  if command -v xdg-open > /dev/null; then
    echo "Press any key to open in browser, or Ctrl+C to cancel"
    read -n 1
    xdg-open "$CHECKOUT_URL"
  elif command -v open > /dev/null; then
    echo "Press any key to open in browser, or Ctrl+C to cancel"
    read -n 1
    open "$CHECKOUT_URL"
  elif command -v start > /dev/null; then
    echo "Press any key to open in browser, or Ctrl+C to cancel"
    read -n 1
    start "$CHECKOUT_URL"
  else
    echo "Copy and paste the URL into your browser"
  fi
else
  echo "Error: Could not extract checkout URL from response"
fi