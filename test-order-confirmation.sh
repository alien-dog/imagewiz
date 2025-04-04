#!/bin/bash

# Set colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the Replit domain from environment
DOMAIN=$(echo $REPLIT_DOMAINS | tr ',' ' ' | cut -d' ' -f1)
if [ -z "$DOMAIN" ]; then
  # Fallback to localhost if not running in Replit
  DOMAIN="localhost:3000"
  echo -e "${YELLOW}Running locally, using $DOMAIN${NC}"
else
  echo -e "${GREEN}Running in Replit environment, using domain: $DOMAIN${NC}"
fi

echo -e "\n${BLUE}===========================================================${NC}"
echo -e "${BLUE}Testing Order Confirmation Page Direct Access${NC}"
echo -e "${BLUE}===========================================================${NC}\n"

# Test 1: Direct access to test HTML page
echo -e "${YELLOW}Test 1: Accessing test HTML page${NC}"
curl -s "http://$DOMAIN/test-order-confirmation.html" | grep -q "<title>Test Order Confirmation Page</title>"
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Test HTML page loads successfully${NC}"
else
  echo -e "${RED}✗ Failed to load test HTML page${NC}"
fi

# Test 2: Direct access to order confirmation page
echo -e "\n${YELLOW}Test 2: Accessing order confirmation page directly${NC}"
response=$(curl -s -i "http://$DOMAIN/order-confirmation")
echo "$response" | grep -q "HTTP/1.1 200"
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Order confirmation page loads with status 200${NC}"
else
  echo -e "${RED}✗ Failed to load order confirmation page${NC}"
  echo -e "${YELLOW}Response headers:${NC}"
  echo "$response" | grep "HTTP"
fi

# Test 3: Access with a test session ID
echo -e "\n${YELLOW}Test 3: Accessing with test session ID${NC}"
response=$(curl -s -i "http://$DOMAIN/order-confirmation?session_id=test_session_123")
echo "$response" | grep -q "HTTP/1.1 200"
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Order confirmation page with session_id loads with status 200${NC}"
else
  echo -e "${RED}✗ Failed to load order confirmation page with session_id${NC}"
  echo -e "${YELLOW}Response headers:${NC}"
  echo "$response" | grep "HTTP"
fi

# Test 4: Access with a test payment intent
echo -e "\n${YELLOW}Test 4: Accessing with test payment intent${NC}"
response=$(curl -s -i "http://$DOMAIN/order-confirmation?payment_intent=test_pi_123")
echo "$response" | grep -q "HTTP/1.1 200"
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Order confirmation page with payment_intent loads with status 200${NC}"
else
  echo -e "${RED}✗ Failed to load order confirmation page with payment_intent${NC}"
  echo -e "${YELLOW}Response headers:${NC}"
  echo "$response" | grep "HTTP"
fi

# Test 5: Test redirects from legacy routes
echo -e "\n${YELLOW}Test 5: Testing redirect from payment-verify to order-confirmation${NC}"
response=$(curl -s -i -L "http://$DOMAIN/payment-verify?session_id=test_session_123")
echo "$response" | grep -q "HTTP/1.1 200"
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Redirect from payment-verify works${NC}"
else
  echo -e "${RED}✗ Failed to follow redirect from payment-verify${NC}"
  echo -e "${YELLOW}Response headers:${NC}"
  echo "$response" | grep "HTTP"
fi

echo -e "\n${BLUE}===========================================================${NC}"
echo -e "${BLUE}All tests completed.${NC}"
echo -e "${BLUE}===========================================================${NC}\n"

echo -e "${YELLOW}Direct access links:${NC}"
echo -e "${GREEN}Test page: http://$DOMAIN/test-order-confirmation.html${NC}"
echo -e "${GREEN}Order confirmation: http://$DOMAIN/order-confirmation${NC}"
echo -e "${GREEN}With session ID: http://$DOMAIN/order-confirmation?session_id=test_session_123${NC}"
