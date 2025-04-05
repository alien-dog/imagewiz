#!/bin/bash

# Define colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Domain
DOMAIN="e3d010d3-10b7-4398-916c-9569531b7cb9-00-nzrxz81n08w.kirk.replit.dev"
SESSION_ID="test_session_123"
TEST_PORT=""  # Leave empty for default ports, or set to e.g. ":3000"

echo -e "${YELLOW}===== TESTING ORDER CONFIRMATION ROUTES =====${NC}"

# Test 1: Main order confirmation route
echo -e "\n${BLUE}Test 1: Accessing /order-confirmation with session_id${NC}"
curl -s -I "https://${DOMAIN}${TEST_PORT}/order-confirmation?session_id=${SESSION_ID}" > /tmp/response.txt
STATUS=$(grep "HTTP/" /tmp/response.txt | awk '{print $2}')

if [ "$STATUS" = "200" ]; then
  echo -e "${GREEN}✓ SUCCESS: Order confirmation page returns 200 OK${NC}"
else
  echo -e "${RED}✗ ERROR: Order confirmation page returns ${STATUS:-unknown status}${NC}"
  cat /tmp/response.txt
fi

# Test 2: With port 3000
echo -e "\n${BLUE}Test 2: Accessing with port 3000${NC}"
curl -s -I "https://${DOMAIN}:3000/order-confirmation?session_id=${SESSION_ID}" > /tmp/response.txt 
STATUS=$(grep "HTTP/" /tmp/response.txt | awk '{print $2}')

if [ "$STATUS" = "200" ]; then
  echo -e "${GREEN}✓ SUCCESS: Order confirmation page with port 3000 returns 200 OK${NC}"
else
  echo -e "${RED}✗ ERROR: Order confirmation page with port 3000 returns ${STATUS:-unknown status}${NC}"
  cat /tmp/response.txt
fi

# Test 3: With URL encoding issues
echo -e "\n${BLUE}Test 3: Testing URL with encoding issues${NC}"
curl -s -I "https://${DOMAIN}${TEST_PORT}/order-confirmation%3Fsession_id=${SESSION_ID}" > /tmp/response.txt
STATUS=$(grep "HTTP/" /tmp/response.txt | awk '{print $2}')
LOCATION=$(grep "Location:" /tmp/response.txt | sed 's/Location: //')

if [ "$STATUS" = "302" ] && [[ "$LOCATION" == */order-confirmation?session_id=* ]]; then
  echo -e "${GREEN}✓ SUCCESS: Encoded URL correctly redirects to proper format${NC}"
  echo -e "  Redirect to: ${LOCATION}"
else
  echo -e "${RED}✗ ERROR: Encoded URL handling failed with status ${STATUS:-unknown status}${NC}"
  cat /tmp/response.txt
fi

# Test 4: Actual Stripe format
echo -e "\n${BLUE}Test 4: Testing URL format Stripe would use${NC}"
curl -s -I "https://${DOMAIN}${TEST_PORT}/order-confirmation?session_id=cs_test_a1example" > /tmp/response.txt
STATUS=$(grep "HTTP/" /tmp/response.txt | awk '{print $2}')

if [ "$STATUS" = "200" ]; then
  echo -e "${GREEN}✓ SUCCESS: Order confirmation page with Stripe session format returns 200 OK${NC}"
else
  echo -e "${RED}✗ ERROR: Order confirmation page with Stripe session format returns ${STATUS:-unknown status}${NC}"
  cat /tmp/response.txt
fi

echo -e "\n${YELLOW}===== TEST COMPLETED =====${NC}"

# Clean up
rm -f /tmp/response.txt

echo -e "\n${BLUE}Summary of findings:${NC}"
echo -e "1. Success URL being sent to Stripe: https://${DOMAIN}${TEST_PORT}/order-confirmation?session_id={CHECKOUT_SESSION_ID}"
echo -e "2. When Stripe redirects, it will replace {CHECKOUT_SESSION_ID} with the actual session ID"
echo -e "3. The redirect will look like: https://${DOMAIN}${TEST_PORT}/order-confirmation?session_id=cs_test_xyz123..."

# Check for presence of port 3000 in the URLs from server logs
echo -e "\n${YELLOW}IMPORTANT NOTE:${NC}"
echo -e "If you're seeing port 3000 in URLs (e.g., ${DOMAIN}:3000), this might be causing issues"
echo -e "as Stripe may strip out this port when redirecting back to your site."
echo -e "Consider removing the explicit port from your success_url."