#!/bin/bash

# This script tests the payment flow against a deployed Replit app
# Change this URL to your actual deployed app URL
REPLIT_URL="https://imagenwiz.replit.app"

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===== TESTING DEPLOYED APP PAYMENT FLOW =====${NC}"
echo -e "Using base URL: ${REPLIT_URL}"

# Step 1: Login
echo -e "\n${YELLOW}Step 1: Login to get auth token${NC}"

TOKEN_RESPONSE=$(curl -s -X POST "${REPLIT_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser2","password":"password123"}')

# Extract the token from the response
TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
if [ -z "$TOKEN" ]; then
  # Try alternate format
  TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
fi

if [ -z "$TOKEN" ]; then
  echo -e "${RED}Failed to get token. Response: $TOKEN_RESPONSE${NC}"
  exit 1
fi

echo -e "${GREEN}Successfully logged in with token: ${TOKEN:0:20}...${NC}"

# Step 2: Get packages
echo -e "\n${YELLOW}Step 2: Loading pricing packages${NC}"

PACKAGES_RESPONSE=$(curl -s -X GET "${REPLIT_URL}/api/payment/packages")
echo -e "Response from /api/payment/packages:"
echo $PACKAGES_RESPONSE | grep -o '"packages"' > /dev/null

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Successfully received packages data${NC}"
  # Count packages
  PACKAGE_COUNT=$(echo $PACKAGES_RESPONSE | grep -o '"id"' | wc -l)
  echo -e "   Found $PACKAGE_COUNT packages"
else
  echo -e "${RED}✗ Failed to get packages or invalid response format${NC}"
  echo -e "Response: $PACKAGES_RESPONSE"
fi

# Step 3: Create checkout session
echo -e "\n${YELLOW}Step 3: User clicks 'Buy' on the Basic package${NC}"

# Create parameters as frontend would
SUCCESS_URL="${REPLIT_URL}/payment-success"
CANCEL_URL="${REPLIT_URL}/pricing"
PACKAGE_ID="basic"

echo -e "Creating checkout session with:"
echo -e "  Package ID: ${PACKAGE_ID}"
echo -e "  Success URL: ${SUCCESS_URL}"
echo -e "  Cancel URL: ${CANCEL_URL}"
echo -e "  Authorization: Bearer ${TOKEN:0:20}..."

# Send the exact request the frontend would send
echo -e "\nSending request to /api/payment/create-checkout-session..."
CHECKOUT_RESPONSE=$(curl -s -X POST "${REPLIT_URL}/api/payment/create-checkout-session" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"package_id\":\"$PACKAGE_ID\",\"success_url\":\"$SUCCESS_URL\",\"cancel_url\":\"$CANCEL_URL\"}")

# Check for a valid response
echo $CHECKOUT_RESPONSE | grep -o '"url"' > /dev/null

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ SUCCESS: Got valid checkout response${NC}"
  CHECKOUT_URL=$(echo $CHECKOUT_RESPONSE | grep -o '"url":"[^"]*' | cut -d'"' -f4)
  echo -e "Stripe checkout URL: ${CHECKOUT_URL:0:60}..."
  echo -e "After payment, Stripe would redirect to: ${SUCCESS_URL}?session_id=xxx"
else
  echo -e "${RED}✗ FAILED: Invalid or error response${NC}"
  echo -e "Response: $CHECKOUT_RESPONSE"
fi

echo -e "\n${YELLOW}===== TEST COMPLETED =====${NC}"
