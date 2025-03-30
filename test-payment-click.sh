#!/bin/bash

# Set your Repl URL here (change if needed)
BASE_URL="http://localhost:3000"

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===== TESTING PAYMENT FLOW FROM FRONTEND CLICK =====${NC}"

# Step 1: Login (this simulates a user being logged in before visiting pricing page)
echo -e "\n${YELLOW}Step 1: Login to get auth token${NC}"
echo -e "This simulates the user logging in before visiting the pricing page"

TOKEN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser2","password":"password123"}')

# Extract the token from the response - try both formats
TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ -z "$TOKEN" ]; then
  # Try alternate format (access_token)
  TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
fi

if [ -z "$TOKEN" ]; then
  echo -e "${RED}Failed to get token. Response: $TOKEN_RESPONSE${NC}"
  exit 1
fi

echo -e "${GREEN}Successfully logged in with token: ${TOKEN:0:20}...${NC}"

# Step 2: Get packages (this happens when user loads the pricing page)
echo -e "\n${YELLOW}Step 2: Loading pricing packages${NC}"
echo -e "This simulates what happens when the user visits /pricing"

PACKAGES_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/payment/packages")
echo -e "Response from /api/payment/packages:"
echo $PACKAGES_RESPONSE | jq . || echo $PACKAGES_RESPONSE

# Step 3: "Click" on a package to buy it
echo -e "\n${YELLOW}Step 3: User clicks 'Buy' on the Basic package${NC}"
echo -e "This simulates what happens when the user clicks on a purchase button"

# Create parameters just as the frontend would
SUCCESS_URL="${BASE_URL}/payment-success"
CANCEL_URL="${BASE_URL}/pricing"
PACKAGE_ID="basic"

echo -e "Creating checkout session with:"
echo -e "  Package ID: ${PACKAGE_ID}"
echo -e "  Success URL: ${SUCCESS_URL}"
echo -e "  Cancel URL: ${CANCEL_URL}"

# Send the exact same request the frontend would send
echo -e "\nSending request to /api/payment/create-checkout-session..."
CHECKOUT_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/payment/create-checkout-session" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"package_id\":\"$PACKAGE_ID\",\"success_url\":\"$SUCCESS_URL\",\"cancel_url\":\"$CANCEL_URL\"}")

echo -e "Response from /api/payment/create-checkout-session:"
echo $CHECKOUT_RESPONSE | jq . || echo $CHECKOUT_RESPONSE

# Check if we got a checkout URL
CHECKOUT_URL=$(echo $CHECKOUT_RESPONSE | grep -o '"url":"[^"]*' | cut -d'"' -f4)

if [ -n "$CHECKOUT_URL" ]; then
  echo -e "\n${GREEN}✓ SUCCESS: Got Stripe checkout URL${NC}"
  echo -e "At this point, the user would be redirected to: ${CHECKOUT_URL}"
  echo -e "After payment, Stripe would redirect back to: ${SUCCESS_URL}?session_id=xxx"
else
  echo -e "\n${RED}✗ FAILED: No checkout URL in response${NC}"
fi

echo -e "\n${YELLOW}===== TEST COMPLETED =====${NC}"
